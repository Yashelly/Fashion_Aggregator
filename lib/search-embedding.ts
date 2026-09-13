import "server-only";

import { createAbortScope } from "@/lib/search-deadline";

const EMBEDDING_MODEL = "gemini-embedding-2";
const EMBEDDING_DIMENSIONS = 1024;
const REQUEST_TIMEOUT_MS = 4_000;
const MAX_CACHE_ENTRIES = 200;

const queryCache = new Map<string, number[]>();

function unitVector(values: number[]) {
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(magnitude) || magnitude === 0) {
    throw new Error("Gemini returned an invalid embedding");
  }
  return values.map((value) => value / magnitude);
}

function remember(query: string, vector: number[]) {
  if (queryCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = queryCache.keys().next().value;
    if (oldest !== undefined) queryCache.delete(oldest);
  }
  queryCache.set(query, vector);
}

export type SearchEmbeddingOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function embedSearchQuery(
  query: string,
  options: SearchEmbeddingOptions = {},
): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const normalizedQuery = query.trim();
  if (!normalizedQuery) return null;
  const cached = queryCache.get(normalizedQuery);
  if (cached) return cached;

  const scope = createAbortScope(
    options.signal,
    Math.min(options.timeoutMs ?? REQUEST_TIMEOUT_MS, REQUEST_TIMEOUT_MS),
  );
  if (scope.signal.aborted) {
    scope.dispose();
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          content: {
            parts: [{
              text: `Retrieve fashion products matching this multilingual shopping request. Query: ${normalizedQuery}`,
            }],
          },
          outputDimensionality: EMBEDDING_DIMENSIONS,
        }),
        cache: "no-store",
        signal: scope.signal,
      },
    );

    if (!response.ok) return null;
    const payload = await response.json() as { embedding?: { values?: number[] } };
    const values = payload.embedding?.values;
    if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) return null;

    const vector = unitVector(values);
    remember(normalizedQuery, vector);
    return vector;
  } catch {
    return null;
  } finally {
    scope.dispose();
  }
}

export const SEARCH_EMBEDDING_CONFIG = {
  dimensions: EMBEDDING_DIMENSIONS,
  model: EMBEDDING_MODEL,
} as const;
