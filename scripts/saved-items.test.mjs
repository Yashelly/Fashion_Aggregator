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

const { createSavedItemsStore, MAX_SAVED_ITEMS, SAVED_ITEMS_STORAGE_KEY, sanitizeSavedItemIds } = loadSavedItems();
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
