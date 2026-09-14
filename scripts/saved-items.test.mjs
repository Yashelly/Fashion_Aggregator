import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
function loadSavedItems() {
  const source = fs.readFileSync(path.join(process.cwd(), "lib", "saved-items.ts"), "utf8");
  const transpiled = require("typescript").transpileModule(source, {
    compilerOptions: { module: "CommonJS", target: "ES2022" },
  }).outputText;
  const moduleScope = { exports: {} };
  new Function("exports", "module", "require", transpiled)(moduleScope.exports, moduleScope, require);
  return moduleScope.exports;
}

function loadRecentSearches() {
  const source = fs.readFileSync(path.join(process.cwd(), "lib", "recent-searches.ts"), "utf8");
  const transpiled = require("typescript").transpileModule(source, {
    compilerOptions: { module: "CommonJS", target: "ES2022" },
  }).outputText;
  const moduleScope = { exports: {} };
  const localRequire = (specifier) => {
    if (!specifier.startsWith("@/lib/")) return require(specifier);
    const dependency = fs.readFileSync(path.join(process.cwd(), "lib", `${specifier.slice("@/lib/".length)}.ts`), "utf8");
    const dependencyCode = require("typescript").transpileModule(dependency, {
      compilerOptions: { module: "CommonJS", target: "ES2022" },
    }).outputText;
    const dependencyModule = { exports: {} };
    new Function("exports", "module", "require", dependencyCode)(dependencyModule.exports, dependencyModule, localRequire);
    return dependencyModule.exports;
  };
  new Function("exports", "module", "require", transpiled)(moduleScope.exports, moduleScope, localRequire);
  return moduleScope.exports;
}

const { createSavedItemsStore, MAX_SAVED_ITEMS, SAVED_ITEMS_STORAGE_KEY, sanitizeSavedItemIds } = loadSavedItems();
const {
  canonicalizeRecentSearchUrl,
  createRecentSearchStore,
  RECENT_SEARCHES_STORAGE_KEY,
  RECENT_SEARCH_VERSION,
} = loadRecentSearches();
function memoryStorage(initial = null) {
  let value = initial;
  return {
    getItem: (key) => key === SAVED_ITEMS_STORAGE_KEY ? value : null,
    setItem: (key, next) => { if (key === SAVED_ITEMS_STORAGE_KEY) value = next; },
    value: () => value,
  };
}

test("sanitizes malformed, duplicate and excessive saved IDs", () => {
  const excessive = Array.from({ length: MAX_SAVED_ITEMS + 5 }, (_, index) => `MOCK${index}`);
  assert.deepEqual(sanitizeSavedItemIds(["MOCK1", "MOCK1", "bad id", null]), ["MOCK1"]);
  assert.equal(sanitizeSavedItemIds(excessive).length, MAX_SAVED_ITEMS);
  const malformed = memoryStorage("not-json");
  assert.deepEqual(createSavedItemsStore(() => malformed).read().ids, []);
});

test("keeps the existing wishlist key and notifies same-page subscribers", () => {
  const storage = memoryStorage(JSON.stringify(["MOCK001"]));
  const store = createSavedItemsStore(() => storage, () => () => undefined);
  let notifications = 0;
  const unsubscribe = store.subscribe(() => { notifications += 1; });
  assert.deepEqual(store.toggle("MOCK002").ids, ["MOCK001", "MOCK002"]);
  assert.deepEqual(JSON.parse(storage.value()), ["MOCK001", "MOCK002"]);
  assert.equal(notifications, 1);
  unsubscribe();
});

test("supports repeated toggles with an in-memory fallback when storage throws", () => {
  const store = createSavedItemsStore(() => { throw new Error("blocked"); }, () => () => undefined);
  assert.deepEqual(store.toggle("MOCK001"), { ids: ["MOCK001"], storageAvailable: false });
  assert.deepEqual(store.toggle("MOCK002").ids, ["MOCK001", "MOCK002"]);
  assert.deepEqual(store.toggle("MOCK001").ids, ["MOCK002"]);
});

test("applies cross-tab storage changes to active subscribers", () => {
  const storage = memoryStorage();
  let externalListener = null;
  const store = createSavedItemsStore(
    () => storage,
    (listener) => { externalListener = listener; return () => { externalListener = null; }; },
  );
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });
  externalListener(SAVED_ITEMS_STORAGE_KEY, JSON.stringify(["MOCK009"]));
  assert.deepEqual(store.getSnapshot().ids, ["MOCK009"]);
  assert.equal(notifications, 1);
});

test("clears saved IDs and notifies same-page subscribers", () => {
  const storage = memoryStorage(JSON.stringify(["MOCK001", "MOCK002"]));
  const store = createSavedItemsStore(() => storage, () => () => undefined);
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });
  assert.deepEqual(store.clear(), { ids: [], storageAvailable: true });
  assert.deepEqual(JSON.parse(storage.value()), []);
  assert.equal(notifications, 1);
});

test("canonicalizes and sanitizes recent search URLs", () => {
  assert.equal(
    canonicalizeRecentSearchUrl("/search?store=demo-store-02&query=wool+coat&unknown=secret&department=women&color=black"),
    "/search?query=wool+coat&department=women&color=black&store=demo-store-02",
  );
  assert.equal(canonicalizeRecentSearchUrl("/account?query=coat"), null);
  assert.equal(canonicalizeRecentSearchUrl("//example.com/search?query=coat"), null);
  assert.equal(canonicalizeRecentSearchUrl("/search?query=coat#details"), null);
});

test("migrates legacy recent searches and deduplicates by canonical URL", () => {
  let value = JSON.stringify([
    { query: " wool   coat ", at: 12 },
    { query: "wool coat", at: 8 },
    { query: "", at: 7 },
  ]);
  const recentStorage = {
    getItem: (key) => key === RECENT_SEARCHES_STORAGE_KEY ? value : null,
    setItem: (key, next) => { if (key === RECENT_SEARCHES_STORAGE_KEY) value = next; },
  };
  const store = createRecentSearchStore(() => recentStorage);
  assert.deepEqual(store.read(), [{
    version: RECENT_SEARCH_VERSION,
    url: "/search?query=wool+coat",
    label: "wool coat",
    timestamp: 12,
  }]);
  assert.deepEqual(JSON.parse(value), store.read());
});

test("repairs malformed recent-search storage without disabling future records", () => {
  let value = "not-json";
  const storage = {
    getItem: () => value,
    setItem: (_key, next) => { value = next; },
  };
  const store = createRecentSearchStore(() => storage);
  assert.deepEqual(store.read(), []);
  store.record({ url: "/search?query=boots", label: "Boots", timestamp: 3 });
  assert.equal(JSON.parse(value)[0].url, "/search?query=boots");
});

test("records complete recent URLs, moves duplicates to the front, and clears history", () => {
  let value = null;
  const storage = {
    getItem: (key) => key === RECENT_SEARCHES_STORAGE_KEY ? value : null,
    setItem: (key, next) => { if (key === RECENT_SEARCHES_STORAGE_KEY) value = next; },
  };
  const store = createRecentSearchStore(() => storage);
  store.record({ url: "/search?query=coat&color=black&page=2", label: "Black coats", timestamp: 1 });
  store.record({ url: "/search?page=2&color=black&query=coat", label: "Coats in black", timestamp: 2 });
  assert.deepEqual(store.read(), [{
    version: RECENT_SEARCH_VERSION,
    url: "/search?query=coat&color=black&page=2",
    label: "Coats in black",
    timestamp: 2,
  }]);
  assert.equal(store.clear(), true);
  assert.deepEqual(store.read(), []);
  assert.deepEqual(JSON.parse(value), []);
});
