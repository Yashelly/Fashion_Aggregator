import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";

const require = createRequire(import.meta.url);

function loadProductListingsModule() {
  const source = fs.readFileSync(path.join(process.cwd(), "lib", "product-listings.ts"), "utf8");
  const transpiled = require("typescript").transpileModule(source, {
    compilerOptions: { module: "CommonJS", target: "ES2022" },
  }).outputText;
  const moduleScope = { exports: {} };
  const localRequire = (id) => {
    if (id === "@/lib/csv") return { readCsvFile: () => [] };
    if (id === "@/lib/demo-stores") {
      return {
        getPublicDemoStoreById: (storeId) => {
          const validStores = new Set(["demo-store-01", "demo-store-02", "demo-store-03", "demo-store-04", "demo-store-05", "demo-store-06"]);
          if (!validStores.has(storeId)) return null;
          return { id: storeId, label: `Store ${storeId}` };
        },
      };
    }

    return require(id);
  };
  new Function("exports", "module", "require", transpiled)(moduleScope.exports, moduleScope, localRequire);
  return moduleScope.exports;
}

const { parseListingRow } = loadProductListingsModule();

function baseListing(overrides = {}) {
  return {
    listing_id: "LST-001",
    mock_product_id: "MOCK-001",
    demo_store_id: "demo-store-01",
    price_eur: "29.99",
    old_price_eur: "39.99",
    currency: "EUR",
    size_options: "S|M|L",
    availability: "in_stock",
    ...overrides,
  };
}

test("parseListingRow accepts a valid synthetic listing row", () => {
  const parsed = parseListingRow(baseListing());
  assert.deepEqual(parsed, {
    listing_id: "LST-001",
    mock_product_id: "MOCK-001",
    demo_store_id: "demo-store-01",
    price_eur: "29.99",
    old_price_eur: "39.99",
    currency: "EUR",
    size_options: "S|M|L",
    availability: "in_stock",
  });
});

test("parseListingRow rejects malformed listing identifiers", () => {
  assert.equal(parseListingRow(baseListing({ listing_id: "bad-001" })), null);
  assert.equal(parseListingRow(baseListing({ listing_id: "" })), null);
});

test("parseListingRow rejects malformed prices", () => {
  for (const price of ["", "-5", "12.999", "1,23", "invalid", Infinity]) {
    assert.equal(parseListingRow(baseListing({ price_eur: `${price}` })), null, price);
  }
});

test("parseListingRow rejects malformed currency codes", () => {
  assert.equal(parseListingRow(baseListing({ currency: "EURO" })), null);
  assert.equal(parseListingRow(baseListing({ currency: "EU" })), null);
  assert.equal(parseListingRow(baseListing({ currency: "12" })), null);
});

test("parseListingRow rejects malformed store ids", () => {
  assert.equal(parseListingRow(baseListing({ demo_store_id: "unknown-store" })), null);
  assert.equal(parseListingRow(baseListing({ demo_store_id: "demo-store-99" })), null);
});

test("parseListingRow rejects malformed size lists", () => {
  assert.equal(parseListingRow(baseListing({ size_options: "" })), null);
  assert.equal(parseListingRow(baseListing({ size_options: "   | | " })), null);
});

test("parseListingRow rejects malformed availability values", () => {
  assert.equal(parseListingRow(baseListing({ availability: "soon" })), null);
  assert.equal(parseListingRow(baseListing({ availability: "" })), null);
  assert.equal(parseListingRow(baseListing({ availability: "in-stock" })), null);
});
