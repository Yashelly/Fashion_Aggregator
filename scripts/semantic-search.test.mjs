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

// 8. Negative query: an unstocked, unrecognised item invents no answer.
test("negative query: an item the catalog does not stock returns nothing", () => {
  const dress = product({ mock_product_id: "dress", subcategory: "dress", category: "dresses", title: "Slip Dress" });
  const shoe = product({ mock_product_id: "shoe", subcategory: "sneakers", category: "shoes", title: "Court Sneaker" });

  assert.deepEqual(idsFor([dress, shoe], "wetsuit"), [], "an unstocked, unlearned item must not invent a result");
});

// 9. Naming a colour EXCLUDES the wrong colours outright — it is not merely a
//    ranking nudge. This is the colour-constraint fix (EXCLUDE_OFF_COLOR): the
//    black dress is the only answer to "black dress", and the blue one is gone
//    entirely, not just ranked lower.
test("a named colour excludes the wrong colours: 'black dress' drops the blue dress", () => {
  const black = product({ mock_product_id: "black-dress", subcategory: "dress", category: "dresses", color: "black", title: "Black Dress" });
  const blue = product({ mock_product_id: "blue-dress", subcategory: "dress", category: "dresses", color: "blue", title: "Blue Dress" });

  const ids = idsFor([black, blue], "black dress");
  assert.deepEqual(ids, ["black-dress"], "only the black dress answers 'black dress'; the blue one is excluded");
});

// 10. A named-but-unstocked colour on a stocked garment returns the honest empty
//     result rather than a differently-coloured near-miss. This is exactly the
//     "yellow dress" class the fix closed (asserted on synthetic rows, so the
//     sealed blind set is not involved).
test("colour negative: an unstocked colour on a stocked garment returns nothing", () => {
  const black = product({ mock_product_id: "black-dress", subcategory: "dress", category: "dresses", color: "black", title: "Black Dress" });
  const blue = product({ mock_product_id: "blue-dress", subcategory: "dress", category: "dresses", color: "blue", title: "Blue Dress" });

  assert.deepEqual(idsFor([black, blue], "yellow dress"), [], "no dress is yellow, so the honest answer is empty");
});

// 11. A colour *quality* (dark/light/neutral/bright) describes a range, not one
//     colour, so it must NOT hard-filter: "dark coat" keeps a brown coat.
test("a colour quality does not hard-filter: 'dark coat' keeps a brown coat", () => {
  const brown = product({ mock_product_id: "brown-coat", subcategory: "coat", category: "outerwear", color: "brown", title: "Brown Coat" });

  assert.ok(idsFor([brown], "dark coat").includes("brown-coat"), "'dark' is a range, not a literal colour filter");
});

// 12. Exclusions are hard constraints over direct catalog properties. They
// must not be treated as ordinary positive words or expanded through the graph.
test("negative constraints remove excluded attributes while preserving the subject", () => {
  const black = product({ mock_product_id: "black-shoe", subcategory: "sneakers", category: "shoes", color: "black", title: "Black Sneaker" });
  const white = product({ mock_product_id: "white-shoe", subcategory: "sneakers", category: "shoes", color: "white", title: "White Sneaker" });
  const query = interpretQuery("not black shoes");

  assert.deepEqual(query.excludedTerms, ["black"]);
  assert.ok(query.terms.includes("shoes"), "the noun after a negated colour remains the positive subject");
  assert.deepEqual(idsFor([black, white], "not black shoes"), ["white-shoe"]);
});

// 13. Availability is a real filter, not an unscored word that lets a sold-out
// result through because all of its other concepts matched.
test("in-stock queries exclude limited and out-of-stock products", () => {
  const stocked = product({ mock_product_id: "stocked", subcategory: "skirt", category: "bottoms", availability: "in_stock" });
  const soldOut = product({ mock_product_id: "sold-out", subcategory: "skirt", category: "bottoms", availability: "out_of_stock" });
  const limited = product({ mock_product_id: "limited", subcategory: "skirt", category: "bottoms", availability: "limited" });

  assert.equal(interpretQuery("in-stock skirt").requiresInStock, true);
  assert.deepEqual(idsFor([stocked, soldOut, limited], "in-stock skirt"), ["stocked"]);
});

// 14. Compounds and encoded absences retain their meaning from the visual
// attribute table; they are not approximated as unrelated individual words.
test("construction compounds distinguish cargo pockets and explicit absent belt loops", () => {
  const plain = product({ mock_product_id: "plain", subcategory: "trousers", category: "bottoms", visual_details: "wide_leg|belt_loops_none" });
  const cargo = product({ mock_product_id: "cargo", subcategory: "jeans", category: "bottoms", visual_details: "two_cargo_flap_pockets|belt_loops" });
  const fivePocket = product({ mock_product_id: "five-pocket", subcategory: "jeans", category: "bottoms", visual_details: "five_pocket|belt_loops" });

  assert.deepEqual(idsFor([plain, cargo, fivePocket], "wide-leg bottoms with no belt loops"), ["plain"]);
  assert.deepEqual(idsFor([plain, cargo, fivePocket], "jeans not cargo pockets"), ["five-pocket"]);
});

// 15. A production query plan must preserve an actual range, not collapse it
// to a max-price hint, and must expose the parsed hard constraints for review.
test("multi-language query parsing produces a reviewable structured plan", () => {
  const query = interpretQuery("черное худи в стиле гротеск со звездочками застежкой 100-150 евро");

  assert.equal(query.minPrice, 100);
  assert.equal(query.maxPrice, 150);
  assert.deepEqual(query.unknownTerms, []);
  assert.deepEqual(query.constraints.garmentTypes, ["hoodie"]);
  assert.deepEqual(query.constraints.colors, ["black"]);
  assert.deepEqual(query.constraints.directAttributes, ["star"]);
  assert.ok(query.terms.includes("grotesque"));
  assert.ok(query.terms.includes("closure"));
  assert.ok(!query.text.includes("евро"), "the whole price expression is removed before scoring");

  const verboseRange = interpretQuery("hoodie from €100 to €150");
  assert.equal(verboseRange.minPrice, 100);
  assert.equal(verboseRange.maxPrice, 150);
  assert.ok(!verboseRange.text.includes("100"));

  const typographicRange = interpretQuery("hoodie 100–150 EUR");
  assert.equal(typographicRange.minPrice, 100);
  assert.equal(typographicRange.maxPrice, 150);
});

// 16. Price ranges are part of the search-engine contract itself. Callers must
// not be able to accidentally bypass the floor by forgetting a UI pre-filter.
test("semanticSearch enforces both sides of a price range", () => {
  const cheap = product({ mock_product_id: "cheap", subcategory: "hoodie", color: "black", price_eur: "99" });
  const inRange = product({ mock_product_id: "in-range", subcategory: "hoodie", color: "black", price_eur: "125" });
  const expensive = product({ mock_product_id: "expensive", subcategory: "hoodie", color: "black", price_eur: "151" });

  assert.deepEqual(idsFor([cheap, inRange, expensive], "black hoodie 100-150 euro"), ["in-range"]);
});

// 17. Honest fallback is a separate channel. A missing visual detail never
// becomes an exact match, while category, colour and price stay hard.
test("missing direct attributes yield labelled alternatives, not exact matches", () => {
  const close = product({ mock_product_id: "close", subcategory: "hoodie", color: "black", price_eur: "125", style_tags: "graphic" });
  const wrongPrice = product({ mock_product_id: "wrong-price", subcategory: "hoodie", color: "black", price_eur: "90", style_tags: "graphic" });
  const wrongColor = product({ mock_product_id: "wrong-color", subcategory: "hoodie", color: "grey", price_eur: "125", style_tags: "graphic" });
  const result = semanticSearch([close, wrongPrice, wrongColor], "black hoodie with stars 100-150 euro");

  assert.deepEqual(result.matches, [], "a product without stars is never called exact");
  assert.deepEqual(result.alternatives.map((entry) => entry.product.mock_product_id), ["close"]);
  assert.deepEqual(result.relaxedConstraints, ["star"]);
});

// 18. When the requested detail exists, the fallback channel remains empty.
test("a product satisfying every direct attribute remains an exact match", () => {
  const starred = product({ mock_product_id: "starred", subcategory: "hoodie", color: "black", price_eur: "125", motif: "stars" });
  const plain = product({ mock_product_id: "plain", subcategory: "hoodie", color: "black", price_eur: "125" });
  const result = semanticSearch([plain, starred], "black hoodie with stars 100-150 euro");

  assert.deepEqual(result.matches.map((entry) => entry.product.mock_product_id), ["starred"]);
  assert.deepEqual(result.alternatives, []);
  assert.deepEqual(result.relaxedConstraints, []);
});
