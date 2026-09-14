import "server-only";

import {
  filterProducts,
  searchProducts,
  type MockProduct,
  type ProductSearchResult,
  type SearchFilterParams,
} from "@/lib/mock-products";
import { embedSearchQuery, SEARCH_EMBEDDING_CONFIG } from "@/lib/search-embedding";
import { judgeSearchCandidates } from "@/lib/search-judge";
import { createAbortScope } from "@/lib/search-deadline";
import {
  buildProductTerms,
  interpretQuery,
  semanticSearch,
} from "@/lib/semantic-search";
import { getSupabasePublicServerClient } from "@/lib/supabase-server";

const RRF_K = 60;
// Kept as exported compatibility metadata for the consumed cloud evaluator.
// Fused results are no longer returned when the judge is incomplete.
const ABSOLUTE_SCORE_FLOOR = 0.029287;
const RELATIVE_SCORE_CUTOFF = 0.85;
const MAX_RESULTS = 20;
const JUDGE_CANDIDATES = 40;
const RPC_TIMEOUT_MS = 2_000;
const PIPELINE_TIMEOUT_MS = 8_000;

type VectorMatch = {
  product_id: string;
  similarity: number;
};

type RankedProduct = {
  id: string;
  score: number;
};

export type HybridSearchOutcome = "success" | "fallback";

export type HybridSearchFallbackReason =
  | "aborted"
  | "blank-query"
  | "deadline-exceeded"
  | "embedding-unavailable"
  | "judge-unavailable"
  | "no-candidates"
  | "no-vector-matches"
  | "vector-unavailable";

export type HybridSearchTimings = {
  totalMs: number;
  embeddingMs?: number;
  vectorMs?: number;
  judgeMs?: number;
};

export type HybridSearchDetailedResult = {
  result: ProductSearchResult;
  outcome: HybridSearchOutcome;
  reason: "judge-complete" | HybridSearchFallbackReason;
  timings: HybridSearchTimings;
};

type HybridSearchDependencies = {
  embed: typeof embedSearchQuery;
  vector: (
    query: string,
    products: MockProduct[],
    embedding: number[],
    signal: AbortSignal,
  ) => Promise<RankedProduct[] | null>;
  judge: typeof judgeSearchCandidates;
};

export type HybridSearchExecutionOptions = {
  signal?: AbortSignal;
  /** @internal Test seam; production callers should use the default budget. */
  timeoutMs?: number;
  /** @internal Dependency seam for deterministic, network-free tests. */
  dependencies?: Partial<HybridSearchDependencies>;
};

function eligibleProducts(products: MockProduct[], query: string) {
  const interpretation = interpretQuery(query);
  const constraints = interpretation.constraints;

  return products.filter((product) => {
    const price = Number(product.price_eur);
    if (constraints.minPrice !== undefined && price < constraints.minPrice) return false;
    if (constraints.maxPrice !== undefined && price > constraints.maxPrice) return false;
    if (constraints.availability === "in_stock" && product.availability !== "in_stock") return false;

    const terms = buildProductTerms(product);
    if (constraints.departments.some((term) => !terms.has(term))) return false;
    if (constraints.colors.length > 0 && !constraints.colors.some((term) => terms.has(term))) return false;
    return true;
  });
}

function reciprocalRankFusion(vector: RankedProduct[], graph: RankedProduct[]) {
  const scores = new Map<string, number>();
  const add = (ranked: RankedProduct[]) => {
    ranked.forEach((entry, index) => {
      scores.set(entry.id, (scores.get(entry.id) ?? 0) + 1 / (RRF_K + index + 1));
    });
  };
  add(vector);
  add(graph);
  return [...scores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

async function fetchVectorMatches(
  query: string,
  products: MockProduct[],
  embedding: number[],
  parentSignal: AbortSignal,
) {
  const client = getSupabasePublicServerClient();
  if (!client || products.length === 0) return null;

  const interpretation = interpretQuery(query);
  const constraints = interpretation.constraints;
  const scope = createAbortScope(parentSignal, RPC_TIMEOUT_MS);
  if (scope.signal.aborted) {
    scope.dispose();
    return null;
  }

  try {
    const { data, error } = await client.rpc("match_search_products", {
      p_availability: constraints.availability ?? null,
      p_colors: constraints.colors.length > 0 ? constraints.colors : null,
      p_departments: constraints.departments.length > 0 ? constraints.departments : null,
      p_embedding_model: SEARCH_EMBEDDING_CONFIG.model,
      p_excluded_terms: null,
      p_garment_terms: null,
      p_match_count: Math.min(products.length, 64),
      p_max_price: constraints.maxPrice ?? null,
      p_min_price: constraints.minPrice ?? null,
      p_product_ids: products.map((product) => product.mock_product_id),
      p_query_embedding: embedding,
    }).abortSignal(scope.signal);

    if (error || !Array.isArray(data)) return null;
    return (data as VectorMatch[]).map((match) => ({
      id: match.product_id,
      score: Number(match.similarity),
    }));
  } catch {
    return null;
  } finally {
    scope.dispose();
  }
}

function elapsed(startedAt: number) {
  return Math.max(0, performance.now() - startedAt);
}

async function awaitBounded<T>(
  operation: () => Promise<T>,
  signal: AbortSignal,
): Promise<
  | { status: "completed"; value: T }
  | { status: "aborted" }
  | { status: "failed" }
> {
  if (signal.aborted) return { status: "aborted" };

  let removeAbortListener = () => {};
  const aborted = new Promise<{ status: "aborted" }>((resolve) => {
    const onAbort = () => resolve({ status: "aborted" });
    signal.addEventListener("abort", onAbort, { once: true });
    removeAbortListener = () => signal.removeEventListener("abort", onAbort);
  });

  try {
    return await Promise.race([
      Promise.resolve()
        .then(operation)
        .then(
          (value) => ({ status: "completed" as const, value }),
          () => ({ status: "failed" as const }),
        ),
      aborted,
    ]);
  } finally {
    removeAbortListener();
  }
}

function cancellationReason(scope: ReturnType<typeof createAbortScope>) {
  return scope.timedOut() ? "deadline-exceeded" as const : "aborted" as const;
}

/**
 * Production search path: hard constraints, Gemini vector recall, local graph
 * fusion, then a structured relevance judge over the bounded candidate set.
 * If a cloud dependency is unavailable, the deterministic engine remains the
 * fail-closed fallback rather than turning a search outage into a page error.
 */
export async function searchProductsHybrid(
  products: MockProduct[],
  params: SearchFilterParams,
): Promise<ProductSearchResult> {
  return (await searchProductsHybridDetailed(products, params)).result;
}

export async function searchProductsHybridDetailed(
  products: MockProduct[],
  params: SearchFilterParams,
  options: HybridSearchExecutionOptions = {},
): Promise<HybridSearchDetailedResult> {
  const pipelineStartedAt = performance.now();
  const query = params.query?.trim();
  const fallback = searchProducts(products, params);
  if (!query) {
    return {
      result: fallback,
      outcome: "fallback",
      reason: "blank-query",
      timings: { totalMs: elapsed(pipelineStartedAt) },
    };
  }

  const scope = createAbortScope(options.signal, options.timeoutMs ?? PIPELINE_TIMEOUT_MS);
  const dependencies: HybridSearchDependencies = {
    embed: embedSearchQuery,
    vector: fetchVectorMatches,
    judge: judgeSearchCandidates,
    ...options.dependencies,
  };
  const timings: HybridSearchTimings = { totalMs: 0 };
  const finish = (
    outcome: HybridSearchOutcome,
    reason: HybridSearchDetailedResult["reason"],
    result = fallback,
  ): HybridSearchDetailedResult => ({
    result,
    outcome,
    reason,
    timings: { ...timings, totalMs: elapsed(pipelineStartedAt) },
  });

  try {
    if (scope.signal.aborted) return finish("fallback", cancellationReason(scope));

    const faceted = filterProducts(products, params);
    const eligible = eligibleProducts(faceted, query);
    if (eligible.length === 0) return finish("fallback", "no-candidates");
    // Preserve the old no-service fast exit: an embedding has no use without
    // vector storage. Dependency-injected tests intentionally bypass this
    // production preflight by supplying their own vector implementation.
    if (!options.dependencies?.vector && !getSupabasePublicServerClient()) {
      return finish("fallback", "vector-unavailable");
    }

    const embeddingStartedAt = performance.now();
    const embeddingAttempt = await awaitBounded(
      () => dependencies.embed(query, { signal: scope.signal }),
      scope.signal,
    );
    timings.embeddingMs = elapsed(embeddingStartedAt);
    if (embeddingAttempt.status === "aborted") {
      return finish("fallback", cancellationReason(scope));
    }
    if (embeddingAttempt.status === "failed") {
      return finish("fallback", "embedding-unavailable");
    }
    const embedding = embeddingAttempt.value;
    if (!embedding) return finish("fallback", "embedding-unavailable");
    if (scope.signal.aborted) return finish("fallback", cancellationReason(scope));

    const vectorStartedAt = performance.now();
    const vectorAttempt = await awaitBounded(
      () => dependencies.vector(query, eligible, embedding, scope.signal),
      scope.signal,
    );
    timings.vectorMs = elapsed(vectorStartedAt);
    if (vectorAttempt.status === "aborted") {
      return finish("fallback", cancellationReason(scope));
    }
    if (vectorAttempt.status === "failed") {
      return finish("fallback", "vector-unavailable");
    }
    const vector = vectorAttempt.value;
    if (!vector) return finish("fallback", "vector-unavailable");
    if (vector.length === 0) return finish("fallback", "no-vector-matches");
    if (scope.signal.aborted) return finish("fallback", cancellationReason(scope));

    const graphResult = semanticSearch(eligible, query);
    const graph = graphResult.matches.map((match) => ({
      id: match.product.mock_product_id,
      score: match.score,
    }));
    const fused = reciprocalRankFusion(vector, graph);
    if (fused.length === 0) return finish("fallback", "no-vector-matches");

    const byId = new Map(eligible.map((product) => [product.mock_product_id, product]));
    const judgeCandidates = fused
      .slice(0, JUDGE_CANDIDATES)
      .map((entry) => byId.get(entry.id))
      .filter((product): product is MockProduct => product !== undefined);
    if (judgeCandidates.length === 0) return finish("fallback", "no-candidates");
    if (scope.signal.aborted) return finish("fallback", cancellationReason(scope));

    const judgeStartedAt = performance.now();
    const judgeAttempt = await awaitBounded(
      () => dependencies.judge(query, judgeCandidates, { signal: scope.signal }),
      scope.signal,
    );
    timings.judgeMs = elapsed(judgeStartedAt);
    if (judgeAttempt.status === "aborted") {
      return finish("fallback", cancellationReason(scope));
    }
    if (judgeAttempt.status === "failed") {
      return finish("fallback", "judge-unavailable");
    }
    const judgedIds = judgeAttempt.value;
    if (!judgedIds) return finish("fallback", "judge-unavailable");
    if (scope.signal.aborted) return finish("fallback", cancellationReason(scope));

    const judgedResults = judgedIds
      .map((id) => byId.get(id))
      .filter((product): product is MockProduct => product !== undefined);
    const validated = semanticSearch(judgedResults, query);
    const selected = validated.matches.length > 0
      ? validated.matches
      : validated.alternatives;
    const selectedIds = new Set(selected.map((match) => match.product.mock_product_id));
    const results = judgedResults.filter((product) => selectedIds.has(product.mock_product_id));
    const approximate = validated.matches.length === 0 && validated.alternatives.length > 0;
    return finish("success", "judge-complete", {
      results,
      relevance: new Map(results.map((product) => [
        product.mock_product_id,
        1 - judgedIds.indexOf(product.mock_product_id) / 100,
      ])),
      interpretation: graphResult.interpretation,
      approximate,
      relaxedConstraints: approximate ? validated.relaxedConstraints : [],
    });
  } finally {
    scope.dispose();
  }
}

export const HYBRID_SEARCH_CONFIG = {
  absoluteScoreFloor: ABSOLUTE_SCORE_FLOOR,
  maxResults: MAX_RESULTS,
  relativeScoreCutoff: RELATIVE_SCORE_CUTOFF,
  rrfK: RRF_K,
  pipelineTimeoutMs: PIPELINE_TIMEOUT_MS,
} as const;
