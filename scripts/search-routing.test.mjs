import assert from 'node:assert/strict';
import { test } from 'node:test';
import { performance } from 'node:perf_hooks';
import { createSearchLoader } from './load-search-runtime.mjs';
import { DEV_SET, REGRESSION_SET } from './search-queries.mjs';

const load = createSearchLoader();
const { planSearchRoute, matchesObjectiveQuery, searchObjectiveProducts, sleeveEvidence } = load('@/lib/search-router');
const { getMockProducts } = load('@/lib/mock-products');
const products = getMockProducts();
const ids = (items) => items.map((p) => p.mock_product_id).sort();

test('complete EN/LT objective requests use the fast route', () => {
  for (const query of ['without sleeves', 'sleeveless', 'be rankovių', 'black jacket under 50',
    'juoda striukė iki 50 €', 'in stock', 'on sale', 'long sleeves', 'short sleeves',
    'black', 'jeans', 'sleeveless tops under 30 euros']) {
    assert.equal(planSearchRoute(query).route, 'objective', query);
  }
});

test('known words do not prove known meaning; incomplete grammar goes to AI', () => {
  for (const query of ['black or white', 'not black', 'black not white', 'without long sleeves',
    'black jacket actually white', 'long dress', 'red carpet dress', 'black tie',
    'something like Acne', 'without sleeves or pockets', 'short sleeves and sleeveless',
    'under 50 dollars', 'two black jackets', 'cheap', 'jacket dress', 'blak jacket',
    'without sleeves except shirts', 'not without sleeves', 'be ilgų rankovių']) {
    const decision = planSearchRoute(query);
    assert.equal(decision.route, 'hybrid', query);
    assert.equal(decision.constraints, null, `unsafe partial interpretation: ${query}`);
  }
});

test('mixed style query retains only a supported, unambiguous objective prefix', () => {
  const plan = planSearchRoute('black jacket for an unusual evening outfit');
  assert.equal(plan.route, 'hybrid');
  assert.equal(matchesObjectiveQuery({ ...products[0], category: 'outerwear', subcategory: 'jacket', color: 'white' }, plan.constraints), false);
  assert.equal(planSearchRoute('black jacket for evening but actually white').constraints, null);
});

test('sleeveless requires affirmative evidence on an applicable garment', () => {
  const base = { ...products[0], visual_details: 'sleeveless', category: 'tops', subcategory: 'tank' };
  const constraints = planSearchRoute('without sleeves').constraints;
  assert.equal(matchesObjectiveQuery(base, constraints), true);
  for (const patch of [
    { visual_details: '' }, { visual_details: 'long_sleeves' },
    { visual_details: 'sleeveless|long_sleeves' },
    { visual_details: 'sleeveless|sleeved' },
    { visual_details: 'sleeveless|short_sleeved' },
    { visual_details: 'sleeveless|long-sleeves' },
    { category: 'bottoms', subcategory: 'trousers' },
    { category: 'bags', subcategory: 'tote' },
  ]) assert.equal(matchesObjectiveQuery({ ...base, ...patch }, constraints), false, JSON.stringify(patch));
  assert.equal(sleeveEvidence({ ...base, visual_details: '' }), 'unknown');
  assert.equal(sleeveEvidence({ ...base, category: 'bags' }), 'not-applicable');
  assert.equal(sleeveEvidence({ ...base, visual_details: 'short_wide_sleeves' }), 'short');
  assert.equal(sleeveEvidence({ ...base, visual_details: 'long_sleeves' }), 'long');
});

test('garment families include real subtypes without borrowing unrelated graph associations', () => {
  for (const [query, subtypes] of Object.entries({ jacket: ['jacket', 'track_jacket', 'windbreaker', 'parka', 'overshirt'],
    sweatshirt: ['sweatshirt', 'hoodie'], pants: ['jeans', 'trousers', 'sweatpants', 'joggers', 'leggings'] })) {
    for (const subcategory of subtypes) assert.equal(matchesObjectiveQuery({ ...products[0], subcategory }, planSearchRoute(query).constraints), true, `${query}: ${subcategory}`);
  }
  assert.equal(matchesObjectiveQuery({ ...products[0], subcategory: 'blazer', title: 'Blue Suit Jacket' }, planSearchRoute('jacket').constraints), true);
  assert.equal(matchesObjectiveQuery({ ...products[0], category: 'sweats', subcategory: 'sweatpants' }, planSearchRoute('sweatshirt').constraints), false);
  assert.equal(matchesObjectiveQuery({ ...products[0], category: 'knitwear' }, planSearchRoute('top').constraints), true);
  assert.equal(matchesObjectiveQuery({ ...products[0], category: 'dresses', subcategory: 'shirt_dress' }, planSearchRoute('shirt').constraints), false);
});

test('actual catalog: sleeve synonyms agree, price/facets stay hard, zero remains exact', () => {
  const results = ['without sleeves', 'sleeveless', 'be rankovių'].map((query) =>
    searchObjectiveProducts(products, { query }, planSearchRoute(query).constraints));
  assert.deepEqual(ids(results[0].results), ['MOCK-004', 'MOCK-019']);
  assert.deepEqual(ids(results[0].results), ids(results[1].results));
  assert.deepEqual(ids(results[0].results), ids(results[2].results));
  const query = 'sleeveless under 20';
  assert.deepEqual(ids(searchObjectiveProducts(products, { query }, planSearchRoute(query).constraints).results), ['MOCK-004']);
  const none = searchObjectiveProducts(products, { query, category: 'bags' }, planSearchRoute(query).constraints);
  assert.equal(none.results.length, 0);
  assert.equal(none.approximate, false);
  assert.deepEqual(none.relaxedConstraints, []);
});

test('structured color evidence is independent of title, unknown/non-EUR prices fail closed', () => {
  const constraints = planSearchRoute('black jacket under 50').constraints;
  const p = { ...products[0], category: 'outerwear', subcategory: 'jacket', color: 'black', price_eur: '49', currency: 'EUR' };
  assert.equal(matchesObjectiveQuery(p, constraints), true);
  for (const patch of [{ color: 'white', title: 'Black Jacket' }, { price_eur: '50' },
    { price_eur: '' }, { price_eur: 'oops' }, { currency: 'USD' }]) {
    assert.equal(matchesObjectiveQuery({ ...p, ...patch }, constraints), false);
  }
});

test('broad color families retain existing structured-color semantics; explicit shades stay exact', () => {
  for (const [color, shades] of Object.entries({
    white: ['white', 'ivory', 'cream'], blue: ['blue', 'washed_blue', 'navy'],
    green: ['green', 'olive', 'sage', 'emerald', 'khaki', 'forest'],
    brown: ['brown', 'camel', 'chocolate', 'tan'], grey: ['grey', 'charcoal'], red: ['red', 'burgundy'],
  })) {
    for (const shade of shades) assert.equal(matchesObjectiveQuery({ ...products[0], color: shade }, planSearchRoute(color).constraints), true, `${color}: ${shade}`);
  }
  assert.equal(matchesObjectiveQuery({ ...products[0], color: 'blue' }, planSearchRoute('navy').constraints), false);
  assert.equal(matchesObjectiveQuery({ ...products[0], color: 'navy' }, planSearchRoute('navy').constraints), true);
  assert.equal(matchesObjectiveQuery({ ...products[0], color: 'navvy' }, planSearchRoute('blue').constraints), false);
  assert.equal(matchesObjectiveQuery({ ...products[0], color: 'greeen' }, planSearchRoute('green').constraints), false);
});

test('warm deterministic search p95 stays below 100 ms (64-product fixture)', () => {
  const constraints = planSearchRoute('without sleeves').constraints;
  const times = [];
  for (let i = 0; i < 100; i++) {
    const start = performance.now();
    searchObjectiveProducts(products, { query: 'without sleeves' }, constraints);
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  assert.ok(times[94] < 100, `p95=${times[94]}ms`);
  console.info(`objective fixture p50=${times[49].toFixed(2)}ms p95=${times[94].toFixed(2)}ms`);
});

test('every routed DEV/REGRESSION case meets the existing relevance gate', () => {
  let routed = 0;
  for (const fixture of [...DEV_SET, ...REGRESSION_SET]) {
    const route = planSearchRoute(fixture.query);
    if (route.route !== 'objective') continue;
    routed++;
    const ranked = searchObjectiveProducts(products, { query: fixture.query }, route.constraints)
      .results.map((p) => p.mock_product_id);
    const k = Math.min(5, fixture.relevant.length);
    const precision = k ? ranked.slice(0, k).filter((id) => fixture.relevant.includes(id)).length / k : Number(ranked.length === 0);
    assert.ok(precision >= 0.6, `${fixture.query}: precision ${precision}`);
    const requiredWindow = Math.max(k, fixture.mustRank?.length ?? 0);
    for (const id of fixture.mustRank ?? []) assert.ok(ranked.slice(0, requiredWindow).includes(id), fixture.query);
    if (fixture.maxResults !== undefined) assert.ok(ranked.length <= fixture.maxResults, fixture.query);
    for (const id of fixture.forbiddenTop ?? []) assert.ok(!ranked.slice(0, fixture.forbiddenTopK ?? 5).includes(id), fixture.query);
  }
  assert.ok(routed > 0);
  console.info(`Existing DEV/REGRESSION cases routed directly: ${routed}; others retain hybrid search.`);
});
