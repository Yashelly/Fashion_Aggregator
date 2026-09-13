import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSearchLoader } from './load-search-runtime.mjs';

function setup(outcome = 'success', choose = (products) => products.slice(0, 1)) {
  let calls = 0;
  let received;
  const load = createSearchLoader({
    '@/lib/hybrid-search': {
      searchProductsHybridDetailed: async (products, params) => {
        calls++;
        received = products;
        return {
          result: { ...load('@/lib/mock-products').searchProducts(products, params), results: choose(products) },
          outcome, reason: outcome === 'success' ? 'success' : 'judge-failed', timings: { totalMs: 1 },
        };
      },
    },
  });
  return { load, calls: () => calls, received: () => received,
    search: load('@/lib/search-runtime').searchProductsWithRuntime,
    products: load('@/lib/mock-products').getMockProducts() };
}

test('cold-cache simple requests never invoke cloud pipeline, even when empty', async () => {
  const { search, products, calls } = setup();
  for (const query of ['without sleeves', 'be rankovių', 'black jacket under 50', 'sleeveless under 1', 'jeans']) {
    const result = await search(products, { query });
    assert.equal(result.diagnostics.mode, 'objective');
    assert.equal(result.diagnostics.cacheStatus, 'bypass');
  }
  await search(products, {});
  assert.equal(calls(), 0);
});

test('explicit success caches empty and fallback-equivalent results', async () => {
  for (const choose of [() => [], (products) => products.slice(0, 1)]) {
    const { search, products, calls } = setup('success', choose);
    const query = 'something unusual';
    assert.equal((await search(products, { query })).diagnostics.cacheStatus, 'miss');
    assert.equal((await search(products, { query })).diagnostics.cacheStatus, 'hit');
    assert.equal(calls(), 1);
  }
});

test('fallback is never retained as successful search', async () => {
  const { search, products, calls } = setup('fallback');
  await search(products, { query: 'something unusual' });
  const next = await search(products, { query: 'something unusual' });
  assert.equal(next.diagnostics.mode, 'hybrid-or-fallback');
  assert.equal(next.diagnostics.cacheStatus, 'miss');
  assert.equal(calls(), 2);
});

test('mixed query prefilters and postfilters authoritative attributes', async () => {
  const context = setup('success', () => context.products);
  const result = await context.search(context.products, { query: 'sleeveless for an unusual outfit' });
  const ids = (products) => products.map((p) => p.mock_product_id).sort();
  assert.deepEqual(ids(context.received()), ['MOCK-004', 'MOCK-019']);
  assert.deepEqual(ids(result.results), ['MOCK-004', 'MOCK-019']);
});

test('cache identity includes catalog changes and facets', async () => {
  const { search, products, calls } = setup();
  await search(products, { query: 'unusual outfit' });
  await search(products, { query: 'unusual outfit', category: 'tops' });
  await search(products.map((p) => ({ ...p, price_eur: '123' })), { query: 'unusual outfit' });
  assert.equal(calls(), 3);
});

test('rollback switch sends objective requests through existing cloud path', async () => {
  const previous = process.env.SEARCH_OBJECTIVE_ROUTING;
  try {
    process.env.SEARCH_OBJECTIVE_ROUTING = 'off';
    const { search, products, calls } = setup();
    assert.equal((await search(products, { query: 'without sleeves' })).diagnostics.mode, 'hybrid-confirmed');
    assert.equal(calls(), 1);
  } finally {
    if (previous === undefined) delete process.env.SEARCH_OBJECTIVE_ROUTING;
    else process.env.SEARCH_OBJECTIVE_ROUTING = previous;
  }
});
