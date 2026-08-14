/**
 * Unit invariants for the concept-graph search engine (lib/semantic-search.ts).
 *
 * The relevance eval (`npm run test:search`) proves the ranker is *good* against
 * a labelled catalog; these tests pin the *rules* it must never break, in
 * isolation from the catalog data. When an edge is retuned, the eval score can
 * drift a little and still pass — these assertions cannot, so they are where a
 * genuine regression (denim→jeans leaking, fuzzy rewriting catalog text) trips.
 *
 *   node --test scripts/semantic-search.test.mjs
 *
 * Runs under Node's built-in test runner with no extra dependencies, loading the
 * same TypeScript source the app ships via scripts/load-search.mjs.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { loadSemanticSearch } from "./load-search.mjs";

const {
  interpretQuery,
  buildProductTerms,
  semanticSearch,
} = loadSemanticSearch();

/** A minimal SearchableProduct with catalog-shaped defaults. */
function product(overrides) {
  return {
    mock_product_id: "x",
    title: "",
    category: "",
    subcategory: "",
    brand: "",
    gender: "unisex",
    color: "",
    style_tags: "",
    old_price_eur: "",
    availability: "in_stock",
    price_eur: "50",
    ...overrides,
  };
}

const idsFor = (products, query) =>
  semanticSearch(products, query).matches.map((match) => match.product.mock_product_id);

// 1. Intent → canonical concepts. Filler words drop out; EN and LT collapse to
//    the same canonical terms.
test("intent resolves to canonical concepts and strips filler", () => {
  const q = interpretQuery("something warm for winter");
  assert.deepEqual([...q.terms].sort(), ["warm", "winter"]);
  assert.deepEqual(q.unknownTerms, []);
});

test("Lithuanian surface forms canonicalise like English", () => {
  const q = interpretQuery("juoda suknelė");
  assert.ok(q.terms.includes("black"), "juoda → black");
  assert.ok(q.terms.includes("dress"), "suknelė → dress");
});

// 2. Naming a garment excludes unrelated garment categories outright — it is not
//    merely ranked lower.
test("an explicit garment excludes unrelated garment categories", () => {
  const parka = product({ mock_product_id: "parka", subcategory: "parka", category: "outerwear", title: "Storm Parka" });
  const sneakers = product({ mock_product_id: "sneakers", subcategory: "sneakers", category: "shoes", title: "Court Sneakers" });

  const ids = idsFor([parka, sneakers], "shoes");
  assert.ok(ids.includes("sneakers"), "shoes should answer with sneakers");
  assert.ok(!ids.includes("parka"), "a parka is a wrong answer to 'shoes', not a low-ranked one");
});

// 3. Unknown terms: an unrecognised token stays unknown (not silently dropped)
//    and still matches literally against the raw product row.
test("unknown terms are surfaced and still match the raw row", () => {
  const q = interpretQuery("blazer qwerty");
  assert.ok(q.terms.includes("blazer"));
  assert.ok(q.unknownTerms.includes("qwerty"), "an unlearned token must not vanish");

  const echo = product({ mock_product_id: "echo", title: "Echo Row Tee", brand: "Echo", subcategory: "tee" });
  const plain = product({ mock_product_id: "plain", title: "Plain Tee", subcategory: "tee" });
  const ids = idsFor([echo, plain], "echo");
  assert.ok(ids.includes("echo"), "a brand/title word outside the lexicon still finds its product");
  assert.ok(!ids.includes("plain"));
});

// 4. Price extraction: the ceiling is parsed (EN and LT) and removed from the
//    text that gets scored.
test("price ceilings are parsed and stripped from the scored text", () => {
  const under = interpretQuery("dress under 50");
  assert.equal(under.maxPrice, 50);
  assert.ok(!under.text.includes("50"), "the price phrase must not survive into the concept text");

  assert.equal(interpretQuery("suknelė iki 50").maxPrice, 50, "LT 'iki 50'");
  assert.equal(interpretQuery("black dress").maxPrice, undefined, "no price phrase → no ceiling");
});

// 5. Graph expansion reaches concrete garments the product never names, at one
//    and two hops, without the shopper typing them.
test("intent expands one and two hops to concrete garments", () => {
  const coat = product({ mock_product_id: "coat", subcategory: "coat", category: "tops", title: "Long Coat" });
  const sweater = product({ mock_product_id: "sweater", subcategory: "sweater", category: "tops", title: "Ribbed Sweater" });
  const tee = product({ mock_product_id: "tee", subcategory: "tee", category: "tops", title: "Cotton Tee" });

  const ids = idsFor([coat, sweater, tee], "cold");
  assert.ok(ids.includes("coat"), "one hop: cold → coat");
  assert.ok(ids.includes("sweater"), "two hops: cold → winter/warm → sweater");
  assert.ok(!ids.includes("tee"), "a tee is not an answer to 'cold'");
});

// 6. Regression: "denim jacket" asks for a jacket made of denim. Jeans satisfy
//    the 'denim' concept but not the 'jacket' subject, so they must be excluded.
test("regression: 'denim jacket' does not return jeans", () => {
  const denimJacket = product({ mock_product_id: "denim-jacket", subcategory: "jacket", category: "outerwear", title: "Denim Jacket", style_tags: "denim" });
  const jeans = product({ mock_product_id: "jeans", subcategory: "jeans", category: "bottoms", title: "Slim Jeans" });

  const ids = idsFor([denimJacket, jeans], "denim jacket");
  assert.ok(ids.includes("denim-jacket"), "the denim jacket is the answer");
  assert.ok(!ids.includes("jeans"), "jeans answer 'denim' but not the 'jacket' subject");
});

// 7. Regression: catalog text is canonicalised with fuzzy matching OFF, so a
//    'dropped_shoulder' tag is never rewritten to the near-identical 'cropped'.
test("regression: catalog fuzzy is off — 'dropped_shoulder' is not 'cropped'", () => {
  const droppedTerms = buildProductTerms(product({ subcategory: "shirt", style_tags: "dropped_shoulder" }));
  assert.ok(!droppedTerms.has("cropped"), "a one-edit neighbour in catalog text must not be rewritten");

  const croppedTerms = buildProductTerms(product({ subcategory: "top", style_tags: "cropped" }));
  assert.ok(croppedTerms.has("cropped"), "an actual 'cropped' tag still canonicalises to cropped");
});
