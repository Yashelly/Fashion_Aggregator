import assert from "node:assert/strict";
import test from "node:test";
import { mapCatalogProductForSearch } from "./search-catalog-postgres.mjs";

test("maps the safe catalog read model into the search document shape", () => {
  const product = mapCatalogProductForSearch({
    public_product_id: "live-product-1",
    public_store_id: "store-01",
    source_status: "affiliate_live",
    title: "Wool coat",
    category: "jackets",
    price_eur: "129.00",
    currency: "EUR",
  });
  assert.equal(product.mock_product_id, "live-product-1");
  assert.equal(product.source_status, "affiliate_live");
  assert.equal(product.price_eur, "129.00");
  assert.equal(product.color, "");
  assert.equal(product.visual_description, "");
  assert.equal("source_product_id" in product, false);
});
