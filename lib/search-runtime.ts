import "server-only";

import crypto from "node:crypto";
import { searchProductsHybrid } from "@/lib/hybrid-search";
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

function resultSignature(result: ProductSearchResult) {
  return JSON.stringify({
    approximate: result.approximate,
    ids: result.results.map((product) => product.mock_product_id),
    relevance: [...result.relevance.entries()],
    relaxedConstraints: result.relaxedConstraints,
  });
}

function cacheKey(params: SearchFilterParams) {
  const normalized = {
    availability: params.availability ?? "",
    category: params.category ?? "",
    color: params.color ?? "",
    gender: params.gender ?? "",
    query: params.query?.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("lt") ?? "",
    sale: params.sale ?? "",
    status: params.status ?? "",
    store: params.store ?? "",
  };
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

function reportSearchRuntime(diagnostics: SearchRuntimeDiagnostics, resultCount: number) {
  console.info(
    `[search-runtime] mode=${diagnostics.mode} cache=${diagnostics.cacheStatus} duration_ms=${diagnostics.durationMs} result_count=${resultCount}`,
  );
}

/**
 * Operational wrapper around the frozen/evaluated ranking implementation.
 * A result is cached only when it differs from the deterministic fallback,
 * which proves that the cloud hybrid path completed. Ambiguous results remain
 * uncached so a transient cloud failure cannot pin fallback output for minutes.
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

  const loaded = await searchCache.getOrLoad(cacheKey(params), async () => {
    const fallback = searchProducts(products, params);
    const hybrid = await searchProductsHybrid(products, params);
    return {
      cacheable: resultSignature(hybrid) !== resultSignature(fallback),
      value: hybrid,
    };
  });
  const diagnostics: SearchRuntimeDiagnostics = {
    cacheStatus: loaded.status,
    durationMs: Math.round(performance.now() - startedAt),
    mode: loaded.cacheable ? "hybrid-confirmed" : "hybrid-or-fallback",
  };
  reportSearchRuntime(diagnostics, loaded.value.results.length);
  return { ...loaded.value, diagnostics };
}

export const SEARCH_RUNTIME_CONFIG = {
  cacheTtlMs: CACHE_TTL_MS,
  maxCacheEntries: MAX_CACHE_ENTRIES,
} as const;
