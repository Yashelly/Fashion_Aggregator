import fs from "node:fs";
import path from "node:path";

const DEFAULT_DIMENSIONS = 1024;
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 5;

export function loadLocalEnv(rootDir) {
  const envPath = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const name = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[name]) process.env[name] = value;
  }
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchJson(url, options, label) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      const bodyText = await response.text();
      let body;
      try {
        body = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        body = { raw: bodyText.slice(0, 500) };
      }

      if (response.ok) return body;
      const retryable = response.status === 429 || response.status >= 500;
      const message = body?.message ?? body?.error?.message ?? body?.raw ?? response.statusText;
      const rateLimitDetails = [
        ["limit", response.headers.get("x-ratelimit-limit-requests")],
        ["remaining", response.headers.get("x-ratelimit-remaining-requests")],
        ["reset", response.headers.get("x-ratelimit-reset-requests")],
        ["retry-after", response.headers.get("retry-after")],
      ].filter(([, value]) => value).map(([name, value]) => `${name}=${value}`).join(", ");
      lastError = new Error(`${label} failed (${response.status}): ${message}${rateLimitDetails ? ` [${rateLimitDetails}]` : ""}`);
      if (!retryable || attempt === MAX_RETRIES) throw lastError;

      const retryAfter = Number(response.headers.get("retry-after"));
      const retryInSeconds = /retry in ([0-9.]+)s/i.exec(String(message))?.[1];
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : retryInSeconds
          ? (Number(retryInSeconds) * 1000) + 1_000
          : Math.min(30_000, 1_000 * (2 ** attempt));
      await sleep(delay);
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES || error?.name === "AbortError") throw error;
      await sleep(Math.min(30_000, 1_000 * (2 ** attempt)));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

function requireKey(name, provider) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${provider} requires ${name} in .env.local`);
  return value;
}

function assertVectors(vectors, expectedCount, dimensions, provider) {
  if (!Array.isArray(vectors) || vectors.length !== expectedCount) {
    throw new Error(`${provider} returned ${vectors?.length ?? "no"} vectors for ${expectedCount} inputs`);
  }
  for (const [index, vector] of vectors.entries()) {
    if (!Array.isArray(vector) || vector.length !== dimensions) {
      throw new Error(`${provider} vector ${index} has ${vector?.length ?? "no"} dimensions; expected ${dimensions}`);
    }
  }
  return vectors;
}

function geminiInstruction(text, inputType) {
  if (inputType === "document") {
    return `Represent this fashion product for retrieval from multilingual shopping queries. ${text}`;
  }
  return `Retrieve fashion products matching this multilingual shopping request. Query: ${text}`;
}

let geminiWindowStartedAt = 0;
let geminiInputsInWindow = 0;

async function reserveGeminiFreeTierCapacity(inputCount) {
  const now = Date.now();
  if (now - geminiWindowStartedAt >= 61_000) {
    geminiWindowStartedAt = now;
    geminiInputsInWindow = 0;
  }
  if (geminiInputsInWindow + inputCount > 90) {
    await sleep(Math.max(0, geminiWindowStartedAt + 61_000 - now));
    geminiWindowStartedAt = Date.now();
    geminiInputsInWindow = 0;
  }
  geminiInputsInWindow += inputCount;
}

export const EMBEDDING_PROVIDERS = {
  cohere: {
    model: "embed-v4.0",
    dimensions: DEFAULT_DIMENSIONS,
    keyName: "COHERE_API_KEY",
    async embed(texts, inputType) {
      const key = requireKey(this.keyName, "Cohere");
      const body = await fetchJson(
        "https://api.cohere.com/v2/embed",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            "X-Client-Name": "weft-search-bakeoff",
          },
          body: JSON.stringify({
            model: this.model,
            texts,
            input_type: inputType === "document" ? "search_document" : "search_query",
            output_dimension: this.dimensions,
            embedding_types: ["float"],
          }),
        },
        "Cohere Embed",
      );
      return assertVectors(body?.embeddings?.float, texts.length, this.dimensions, "Cohere");
    },
  },

  gemini: {
    model: "gemini-embedding-2",
    dimensions: DEFAULT_DIMENSIONS,
    keyName: "GEMINI_API_KEY",
    async embed(texts, inputType) {
      const key = requireKey(this.keyName, "Gemini");
      const modelPath = `models/${this.model}`;
      const vectors = [];
      for (let offset = 0; offset < texts.length; offset += 90) {
        const batch = texts.slice(offset, offset + 90);
        await reserveGeminiFreeTierCapacity(batch.length);
        const requests = batch.map((text) => ({
          model: modelPath,
          content: { parts: [{ text: geminiInstruction(text, inputType) }] },
          outputDimensionality: this.dimensions,
        }));
        const body = await fetchJson(
          `https://generativelanguage.googleapis.com/v1beta/${modelPath}:batchEmbedContents`,
          {
            method: "POST",
            headers: {
              "x-goog-api-key": key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ requests }),
          },
          "Gemini Embedding",
        );
        vectors.push(...assertVectors(
          body?.embeddings?.map((entry) => entry.values),
          batch.length,
          this.dimensions,
          "Gemini",
        ));
      }
      return vectors;
    },
  },

  voyage: {
    model: "voyage-4-large",
    dimensions: DEFAULT_DIMENSIONS,
    keyName: "VOYAGE_API_KEY",
    async embed(texts, inputType) {
      const key = requireKey(this.keyName, "Voyage");
      const body = await fetchJson(
        "https://api.voyageai.com/v1/embeddings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: texts,
            model: this.model,
            input_type: inputType === "document" ? "document" : "query",
            output_dimension: this.dimensions,
            output_dtype: "float",
          }),
        },
        "Voyage Embeddings",
      );
      const ordered = [...(body?.data ?? [])].sort((left, right) => left.index - right.index);
      return assertVectors(
        ordered.map((entry) => entry.embedding),
        texts.length,
        this.dimensions,
        "Voyage",
      );
    },
  },
};

export const RERANK_PROVIDERS = {
  cohere: {
    model: "rerank-v4.0-pro",
    keyName: "COHERE_API_KEY",
    nextAllowedAt: 0,
    async rerank(query, documents) {
      const key = requireKey(this.keyName, "Cohere");
      // Cohere trial keys allow 10 calls/minute. This evaluator deliberately
      // stays under that published limit; production search does not import
      // this module and therefore is not artificially throttled.
      const minimumInterval = Number(process.env.COHERE_RERANK_MIN_INTERVAL_MS ?? "6100");
      const waitFor = Math.max(0, this.nextAllowedAt - Date.now());
      if (waitFor > 0) await sleep(waitFor);
      this.nextAllowedAt = Date.now() + Math.max(0, minimumInterval);
      const body = await fetchJson(
        "https://api.cohere.com/v2/rerank",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            "X-Client-Name": "weft-search-bakeoff",
          },
          body: JSON.stringify({
            model: this.model,
            query,
            documents,
            top_n: documents.length,
            max_tokens_per_doc: 512,
          }),
        },
        "Cohere Rerank",
      );
      return (body?.results ?? []).map((entry) => ({
        index: entry.index,
        score: entry.relevance_score,
      }));
    },
  },

  voyage: {
    model: "rerank-2.5",
    keyName: "VOYAGE_API_KEY",
    async rerank(query, documents) {
      const key = requireKey(this.keyName, "Voyage");
      const body = await fetchJson(
        "https://api.voyageai.com/v1/rerank",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            query,
            documents,
            top_k: documents.length,
            truncation: true,
          }),
        },
        "Voyage Rerank",
      );
      return (body?.data ?? []).map((entry) => ({
        index: entry.index,
        score: entry.relevance_score,
      }));
    },
  },

  voyage3: {
    model: "rerank-3",
    keyName: "VOYAGE_API_KEY",
    async rerank(query, documents) {
      const key = requireKey(this.keyName, "Voyage");
      const body = await fetchJson(
        "https://api.voyageai.com/v1/rerank",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            query,
            documents,
            top_k: documents.length,
            truncation: true,
          }),
        },
        "Voyage Rerank 3",
      );
      return (body?.data ?? []).map((entry) => ({
        index: entry.index,
        score: entry.relevance_score,
      }));
    },
  },
};
