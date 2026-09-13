import "server-only";

import { createSearchCacheKey } from "@/lib/search-cache-key";
import { searchProductsHybridDetailed } from "@/lib/hybrid-search";
import { matchesObjectiveQuery, planSearchRoute, searchObjectiveProducts } from "@/lib/search-router";
import {
  searchProducts,
  type MockProduct,
  type ProductSearchResult,
  type SearchFilterParams,
} from "@/lib/mock-products";
import {
  SearchRuntimeCache,
  type SearchRuntimeDiagnostics,
} from "@/lib/search-runtime-cache";

const CACHE_TTL_MS = 5 * 60 * 1_000;
const MAX_CACHE_ENTRIES = 200;

export type SearchRuntimeResult = ProductSearchResult & {
  diagnostics: SearchRuntimeDiagnostics;
};

const searchCache = new SearchRuntimeCache<ProductSearchResult>({
  maxEntries: MAX_CACHE_ENTRIES,
  ttlMs: CACHE_TTL_MS,
});

function reportSearchRuntime(diagnostics: SearchRuntimeDiagnostics, resultCount: number) {
  console.info(
    `[search-runtime] mode=${diagnostics.mode} cache=${diagnostics.cacheStatus} duration_ms=${diagnostics.durationMs} result_count=${resultCount}`,
  );
}

/**
 * Fully supported objective requests never enter the cloud pipeline. Unknown
 * grammar preserves semantic search. Cache admission uses an explicit successful
 * judge outcome, including empty or fallback-equivalent successful responses.
 */
export async function searchProductsWithRuntime(
  products: MockProduct[],
  params: SearchFilterParams,
): Promise<SearchRuntimeResult> {
  const startedAt = performance.now();
  if (!params.query?.trim()) {
    const result = searchProducts(products, params);
    const diagnostics: SearchRuntimeDiagnostics = {
      cacheStatus: "bypass",
      durationMs: Math.round(performance.now() - startedAt),
      mode: "browse",
    };
    reportSearchRuntime(diagnostics, result.results.length);
    return { ...result, diagnostics };
  }

  const route = planSearchRoute(params.query!);
  const routingEnabled = process.env.SEARCH_OBJECTIVE_ROUTING !== "off";
  const constraints = routingEnabled ? route.constraints : null;
  const parserMs = Math.round(performance.now() - startedAt);
  if (routingEnabled && route.route === "objective" && constraints) {
    const result = searchObjectiveProducts(products, params, constraints);
    const diagnostics: SearchRuntimeDiagnostics = {
      cacheStatus: "bypass",
      durationMs: Math.round(performance.now() - startedAt),
      mode: "objective",
    };
    console.info(`[search-route] reason=${route.reason} parser_ms=${parserMs}`);
    reportSearchRuntime(diagnostics, result.results.length);
    return { ...result, diagnostics };
  }

  const eligible = products.filter((product) => matchesObjectiveQuery(product, constraints));
  const loaded = await searchCache.getOrLoad(createSearchCacheKey(eligible, params), async () => {
    const hybrid = await searchProductsHybridDetailed(eligible, params);
    const { totalMs, embeddingMs = 0, vectorMs = 0, judgeMs = 0 } = hybrid.timings;
    console.info(`[search-stages] outcome=${hybrid.outcome} reason=${hybrid.reason} total_ms=${totalMs} embedding_ms=${embeddingMs} vector_ms=${vectorMs} judge_ms=${judgeMs}`);
    // A final guard keeps supported objective clauses hard even across service
    // responses or fallback ranking changes. Other facets are enforced upstream.
    const results = hybrid.result.results.filter((product) => matchesObjectiveQuery(product, constraints));
    const ids = new Set(results.map((product) => product.mock_product_id));
    return {
      cacheable: hybrid.outcome === "success",
      value: { ...hybrid.result, results, relevance: new Map([...hybrid.result.relevance].filter(([id]) => ids.has(id))) },
    };
  });
  const diagnostics: SearchRuntimeDiagnostics = {
    cacheStatus: loaded.status,
    durationMs: Math.round(performance.now() - startedAt),
    mode: loaded.cacheable ? "hybrid-confirmed" : "hybrid-or-fallback",
  };
  console.info(`[search-route] reason=${routingEnabled ? route.reason : "disabled"} parser_ms=${parserMs}`);
  reportSearchRuntime(diagnostics, loaded.value.results.length);
  return { ...loaded.value, diagnostics };
}

export const SEARCH_RUNTIME_CONFIG = {
  cacheTtlMs: CACHE_TTL_MS,
  maxCacheEntries: MAX_CACHE_ENTRIES,
} as const;
