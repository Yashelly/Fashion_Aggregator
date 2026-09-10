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
import {
  buildProductTerms,
  interpretQuery,
  semanticSearch,
} from "@/lib/semantic-search";
import { getSupabasePublicServerClient } from "@/lib/supabase-server";

const RRF_K = 60;
const ABSOLUTE_SCORE_FLOOR = 0.029287;
const RELATIVE_SCORE_CUTOFF = 0.85;
const MAX_RESULTS = 20;
const JUDGE_CANDIDATES = 40;
const RPC_TIMEOUT_MS = 2_000;

type VectorMatch = {
  product_id: string;
  similarity: number;
};

type RankedProduct = {
  id: string;
  score: number;
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

async function fetchVectorMatches(query: string, products: MockProduct[]) {
  const client = getSupabasePublicServerClient();
  if (!client || products.length === 0) return null;
  const embedding = await embedSearchQuery(query);
  if (!embedding) return null;

  const interpretation = interpretQuery(query);
  const constraints = interpretation.constraints;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);

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
    }).abortSignal(controller.signal);

    if (error || !Array.isArray(data)) return null;
    return (data as VectorMatch[]).map((match) => ({
      id: match.product_id,
      score: Number(match.similarity),
    }));
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
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
  const query = params.query?.trim();
  if (!query) return searchProducts(products, params);

  const fallback = searchProducts(products, params);
  const faceted = filterProducts(products, params);
  const eligible = eligibleProducts(faceted, query);
  const vector = await fetchVectorMatches(query, eligible);
  if (!vector) return fallback;

  const graphResult = semanticSearch(eligible, query);
  const graph = graphResult.matches.map((match) => ({
    id: match.product.mock_product_id,
    score: match.score,
  }));
  const fused = reciprocalRankFusion(vector, graph);
  const best = fused[0]?.score;
  if (best === undefined) return fallback;

  const byId = new Map(eligible.map((product) => [product.mock_product_id, product]));
  const judgeCandidates = fused
    .slice(0, JUDGE_CANDIDATES)
    .map((entry) => byId.get(entry.id))
    .filter((product): product is MockProduct => product !== undefined);
  const judgedIds = await judgeSearchCandidates(query, judgeCandidates);
  if (judgedIds) {
    const judgedResults = judgedIds
      .map((id) => byId.get(id))
      .filter((product): product is MockProduct => product !== undefined);
    return {
      results: judgedResults,
      relevance: new Map(judgedIds.map((id, index) => [id, 1 - index / 100])),
      interpretation: graphResult.interpretation,
      approximate: false,
      relaxedConstraints: [],
    };
  }

  const cutoff = Math.max(ABSOLUTE_SCORE_FLOOR, best * RELATIVE_SCORE_CUTOFF);
  const selected = fused
    .filter((entry) => entry.score >= cutoff)
    .slice(0, MAX_RESULTS);
  if (selected.length === 0) return fallback;

  const results = selected
    .map((entry) => byId.get(entry.id))
    .filter((product): product is MockProduct => product !== undefined);
  if (results.length === 0) return fallback;

  return {
    results,
    relevance: new Map(selected.map((entry) => [entry.id, entry.score])),
    interpretation: graphResult.interpretation,
    approximate: graphResult.matches.length === 0,
    relaxedConstraints: graphResult.matches.length === 0
      ? graphResult.relaxedConstraints
      : [],
  };
}

export const HYBRID_SEARCH_CONFIG = {
  absoluteScoreFloor: ABSOLUTE_SCORE_FLOOR,
  maxResults: MAX_RESULTS,
  relativeScoreCutoff: RELATIVE_SCORE_CUTOFF,
  rrfK: RRF_K,
} as const;
