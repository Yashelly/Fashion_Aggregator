import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const recentSearchesPath = path.join(process.cwd(), "lib", "recent-searches.ts");

function loadRecentSearches() {
  const source = fs.readFileSync(recentSearchesPath, "utf8");
  const transpiled = require("typescript").transpileModule(source, {
    compilerOptions: { module: "CommonJS", target: "ES2022" },
  }).outputText;
  const moduleScope = { exports: {} };
  const localRequire = (specifier) => {
    if (specifier.includes("analytics")) {
      throw new Error(`Recent searches must not load analytics: ${specifier}`);
    }
    if (specifier.startsWith("@/lib/")) {
      const dependency = path.join(process.cwd(), "lib", `${specifier.slice("@/lib/".length)}.ts`);
      const dependencySource = fs.readFileSync(dependency, "utf8");
      const dependencyCode = require("typescript").transpileModule(dependencySource, {
        compilerOptions: { module: "CommonJS", target: "ES2022" },
      }).outputText;
      const dependencyModule = { exports: {} };
      new Function("exports", "module", "require", dependencyCode)(dependencyModule.exports, dependencyModule, localRequire);
      return dependencyModule.exports;
    }
    return require(specifier);
  };
  new Function("exports", "module", "require", transpiled)(moduleScope.exports, moduleScope, localRequire);
  return moduleScope.exports;
}

const {
  canonicalizeRecentSearchUrl,
  createRecentSearchStore,
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_STORAGE_KEY,
  RECENT_SEARCH_VERSION,
} = loadRecentSearches();

function memoryStorage(initial = null) {
  let value = initial;
  return {
    getItem(key) {
      return key === RECENT_SEARCHES_STORAGE_KEY ? value : null;
    },
    setItem(key, next) {
      if (key === RECENT_SEARCHES_STORAGE_KEY) value = next;
    },
    value() {
      return value;
    },
  };
}

test("persists the current versioned recent-search schema", () => {
  const storage = memoryStorage();
  const store = createRecentSearchStore(() => storage);

  assert.deepEqual(store.record({ url: "/search?query=coat", label: "Coat", timestamp: 42 }), [{
    version: RECENT_SEARCH_VERSION,
    url: "/search?query=coat",
    label: "Coat",
    timestamp: 42,
  }]);
  assert.deepEqual(JSON.parse(storage.value()), store.read());
});

test("migrates legacy query records, normalizes labels, and removes canonical duplicates", () => {
  const storage = memoryStorage(JSON.stringify([
    { query: "  wool   coat  ", at: 12 },
    { query: "wool coat", at: 8 },
    { query: "", at: 7 },
    { query: 123, at: 6 },
  ]));
  const store = createRecentSearchStore(() => storage);

  assert.deepEqual(store.read(), [{
    version: RECENT_SEARCH_VERSION,
    url: "/search?query=wool+coat",
    label: "wool coat",
    timestamp: 12,
  }]);
  assert.deepEqual(JSON.parse(storage.value()), store.read());
});

test("canonicalizes the complete search state including repeated facets", () => {
  const url = "/search?store=demo-store-02&color=navy&query=wool+coat&size=S"
    + "&department=women&sale=on&status=in_stock&sort=price-low&perPage=48&page=3"
    + "&lang=lt&category=outerwear&color=black&size=M&store=demo-store-01"
    + "&minPrice=25&maxPrice=200";

  assert.equal(
    canonicalizeRecentSearchUrl(url),
    "/search?query=wool+coat&category=outerwear&department=women&color=black%2Cnavy"
      + "&size=M%2CS&store=demo-store-01%2Cdemo-store-02&status=in_stock&sale=on"
      + "&sort=price-low&minPrice=25&maxPrice=200&page=3&lang=lt",
  );
});

test("uses the shared normalizer for comma, repeated, legacy, and first-page URL forms", () => {
  const canonical = "/search?query=coat&department=women&color=black%2Cnavy&size=M%2CS&store=demo-store-01%2Cdemo-store-02";
  assert.equal(
    canonicalizeRecentSearchUrl("/search?store=demo-store-02&store=demo-store-01&size=S,M&color=navy&color=black&gender=women&query=coat&page=1"),
    canonical,
  );
  assert.equal(
    canonicalizeRecentSearchUrl("/search?query=coat&department=women&color=black,navy&size=M&size=S&store=demo-store-01,demo-store-02"),
    canonical,
  );
});

test("rejects unsafe destinations and strips unsupported or oversized parameters", () => {
  for (const value of [
    "https://weft.example/search?query=coat",
    "//weft.example/search?query=coat",
    "/account?query=coat",
    "/search?query=coat#details",
    `/search?query=${"x".repeat(8192)}`,
  ]) {
    assert.equal(canonicalizeRecentSearchUrl(value), null, value);
  }

  assert.equal(
    canonicalizeRecentSearchUrl("/search?query=coat&unknown=private&color=black"),
    "/search?query=coat&color=black",
  );
  assert.equal(
    canonicalizeRecentSearchUrl(`/search?query=coat&color=${"x".repeat(501)}`),
    "/search?query=coat",
  );
});

test("deduplicates equivalent canonical URLs and moves the latest record to the front", () => {
  const storage = memoryStorage();
  const store = createRecentSearchStore(() => storage);

  store.record({ url: "/search?query=boots", label: "Boots", timestamp: 1 });
  store.record({ url: "/search?color=black&query=coat", label: "Black coats", timestamp: 2 });
  const entries = store.record({
    url: "/search?query=coat&unknown=discarded&color=black",
    label: "Updated black coats",
    timestamp: 3,
  });

  assert.deepEqual(entries.map(({ url, label, timestamp }) => ({ url, label, timestamp })), [
    { url: "/search?query=coat&color=black", label: "Updated black coats", timestamp: 3 },
    { url: "/search?query=boots", label: "Boots", timestamp: 1 },
  ]);
});

test("keeps newest records first and enforces the history limit", () => {
  const storage = memoryStorage();
  const store = createRecentSearchStore(() => storage);

  for (let index = 0; index < MAX_RECENT_SEARCHES + 3; index += 1) {
    store.record({ url: `/search?query=item-${index}`, label: `Item ${index}`, timestamp: index });
  }

  const entries = store.read();
  assert.equal(entries.length, MAX_RECENT_SEARCHES);
  assert.deepEqual(
    entries.map(({ timestamp }) => timestamp),
    Array.from({ length: MAX_RECENT_SEARCHES }, (_, index) => MAX_RECENT_SEARCHES + 2 - index),
  );
});

test("clears persisted recent-search history", () => {
  const storage = memoryStorage();
  const store = createRecentSearchStore(() => storage);
  store.record({ url: "/search?query=boots", label: "Boots", timestamp: 1 });

  assert.equal(store.clear(), true);
  assert.deepEqual(store.read(), []);
  assert.deepEqual(JSON.parse(storage.value()), []);
});

test("repairs malformed JSON and remains writable", () => {
  const storage = memoryStorage("not-json");
  const store = createRecentSearchStore(() => storage);

  assert.deepEqual(store.read(), []);
  assert.deepEqual(JSON.parse(storage.value()), []);
  assert.equal(store.record({ url: "/search?query=boots", label: "Boots", timestamp: 9 })[0].timestamp, 9);
  assert.equal(JSON.parse(storage.value())[0].url, "/search?query=boots");
});

test("falls back to memory when storage throws without requiring analytics delivery", () => {
  let storageCalls = 0;
  const store = createRecentSearchStore(() => {
    storageCalls += 1;
    throw new Error("localStorage blocked");
  });

  assert.deepEqual(store.read(), []);
  assert.equal(store.record({ url: "/search?query=boots", label: "Boots", timestamp: 1 }).length, 1);
  assert.equal(store.record({ url: "/search?query=coat", label: "Coat", timestamp: 2 }).length, 2);
  assert.deepEqual(store.read().map(({ label }) => label), ["Coat", "Boots"]);
  assert.equal(store.clear(), false);
  assert.deepEqual(store.read(), []);
  assert.equal(storageCalls, 1);
});
