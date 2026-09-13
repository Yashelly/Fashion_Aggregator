import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const products = [
  { mock_product_id: "P-1", price_eur: "10", availability: "in_stock" },
  { mock_product_id: "P-2", price_eur: "20", availability: "in_stock" },
];

function fallbackResult(inputProducts) {
  return {
    results: [inputProducts[1]],
    relevance: new Map([["P-2", 0.5]]),
    interpretation: { source: "deterministic" },
    approximate: true,
    relaxedConstraints: ["style"],
  };
}

function loadHybridSearch() {
  const deadlineSource = fs.readFileSync(path.join(rootDir, "lib", "search-deadline.ts"), "utf8");
  const hybridSource = fs.readFileSync(path.join(rootDir, "lib", "hybrid-search.ts"), "utf8");
  const compilerOptions = { module: "CommonJS", target: "ES2022" };
  const transpile = (source) => require("typescript").transpileModule(source, { compilerOptions }).outputText;

  const deadlineModule = { exports: {} };
  new Function("exports", "module", "require", transpile(deadlineSource))(
    deadlineModule.exports,
    deadlineModule,
    (specifier) => specifier === "server-only" ? {} : require(specifier),
  );

  const moduleScope = { exports: {} };
  const localRequire = (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "@/lib/search-deadline") return deadlineModule.exports;
    if (specifier === "@/lib/mock-products") {
      return {
        filterProducts: (inputProducts) => inputProducts,
        searchProducts: fallbackResult,
      };
    }
    if (specifier === "@/lib/search-embedding") {
      return { embedSearchQuery: async () => null, SEARCH_EMBEDDING_CONFIG: { model: "test" } };
    }
    if (specifier === "@/lib/search-judge") {
      return { judgeSearchCandidates: async () => null };
    }
    if (specifier === "@/lib/semantic-search") {
      return {
        buildProductTerms: () => new Set(),
        interpretQuery: () => ({ constraints: { departments: [], colors: [] } }),
        semanticSearch: (inputProducts) => ({
          matches: inputProducts.map((product, index) => ({ product, score: 1 - index / 10 })),
          alternatives: [],
          relaxedConstraints: [],
          interpretation: { source: "graph" },
        }),
      };
    }
    if (specifier === "@/lib/supabase-server") {
      return { getSupabasePublicServerClient: () => null };
    }
    return require(specifier);
  };

  new Function("exports", "module", "require", transpile(hybridSource))(
    moduleScope.exports,
    moduleScope,
    localRequire,
  );
  return moduleScope.exports;
}

function loadEmbedding() {
  const deadlineSource = fs.readFileSync(path.join(rootDir, "lib", "search-deadline.ts"), "utf8");
  const embeddingSource = fs.readFileSync(path.join(rootDir, "lib", "search-embedding.ts"), "utf8");
  const compilerOptions = { module: "CommonJS", target: "ES2022" };
  const transpile = (source) => require("typescript").transpileModule(source, { compilerOptions }).outputText;
  const deadlineModule = { exports: {} };
  new Function("exports", "module", "require", transpile(deadlineSource))(
    deadlineModule.exports,
    deadlineModule,
    (specifier) => specifier === "server-only" ? {} : require(specifier),
  );
  const embeddingModule = { exports: {} };
  new Function("exports", "module", "require", transpile(embeddingSource))(
    embeddingModule.exports,
    embeddingModule,
    (specifier) => {
      if (specifier === "server-only") return {};
      if (specifier === "@/lib/search-deadline") return deadlineModule.exports;
      return require(specifier);
    },
  );
  return embeddingModule.exports;
}

const { searchProductsHybridDetailed } = loadHybridSearch();

function successfulDependencies(overrides = {}) {
  return {
    embed: async () => [1],
    vector: async (_query, inputProducts) => inputProducts.map((product, index) => ({
      id: product.mock_product_id,
      score: 1 - index / 10,
    })),
    judge: async () => ["P-1"],
    ...overrides,
  };
}

test("a valid empty judge response is a complete cloud success", async () => {
  const detailed = await searchProductsHybridDetailed(products, { query: "specific query" }, {
    dependencies: successfulDependencies({ judge: async () => [] }),
    timeoutMs: 100,
  });

  assert.equal(detailed.outcome, "success");
  assert.equal(detailed.reason, "judge-complete");
  assert.deepEqual(detailed.result.results, []);
  assert.equal(detailed.result.approximate, false);
  assert.equal(typeof detailed.timings.totalMs, "number");
  assert.equal(typeof detailed.timings.embeddingMs, "number");
  assert.equal(typeof detailed.timings.vectorMs, "number");
  assert.equal(typeof detailed.timings.judgeMs, "number");
  assert.equal("query" in detailed.timings, false);
});

test("judge failure returns the untouched deterministic fallback, never fused candidates", async () => {
  const detailed = await searchProductsHybridDetailed(products, { query: "subjective query" }, {
    dependencies: successfulDependencies({ judge: async () => null }),
    timeoutMs: 100,
  });

  assert.equal(detailed.outcome, "fallback");
  assert.equal(detailed.reason, "judge-unavailable");
  assert.deepEqual(detailed.result.results, fallbackResult(products).results);
  assert.deepEqual(detailed.result.relevance, fallbackResult(products).relevance);
  assert.equal(detailed.result.approximate, true);
  assert.deepEqual(detailed.result.relaxedConstraints, ["style"]);
});

test("a valid judge result remains a success when it equals the deterministic fallback", async () => {
  const detailed = await searchProductsHybridDetailed(products, { query: "same query" }, {
    dependencies: successfulDependencies({ judge: async () => ["P-2"] }),
    timeoutMs: 100,
  });

  assert.equal(detailed.outcome, "success");
  assert.equal(detailed.reason, "judge-complete");
  assert.deepEqual(detailed.result.results, [products[1]]);
  assert.equal(detailed.result.approximate, false);
});

test("the pipeline deadline bounds a dependency that ignores abort and stops later stages", async () => {
  const calls = [];
  const startedAt = performance.now();
  const detailed = await searchProductsHybridDetailed(products, { query: "slow query" }, {
    dependencies: successfulDependencies({
      embed: async () => {
        calls.push("embed");
        return new Promise(() => {});
      },
      vector: async () => {
        calls.push("vector");
        return [];
      },
      judge: async () => {
        calls.push("judge");
        return [];
      },
    }),
    timeoutMs: 25,
  });

  assert.equal(detailed.outcome, "fallback");
  assert.equal(detailed.reason, "deadline-exceeded");
  assert.deepEqual(calls, ["embed"]);
  assert.ok(performance.now() - startedAt < 250);
  assert.equal(detailed.timings.vectorMs, undefined);
  assert.equal(detailed.timings.judgeMs, undefined);
});

test("external cancellation during vector recall prevents the judge from launching", async () => {
  const controller = new AbortController();
  const calls = [];
  const detailedPromise = searchProductsHybridDetailed(products, { query: "cancel query" }, {
    signal: controller.signal,
    dependencies: successfulDependencies({
      embed: async () => {
        calls.push("embed");
        return [1];
      },
      vector: async () => {
        calls.push("vector");
        return new Promise(() => {});
      },
      judge: async () => {
        calls.push("judge");
        return [];
      },
    }),
    timeoutMs: 500,
  });

  setTimeout(() => controller.abort(), 15);
  const detailed = await detailedPromise;

  assert.equal(detailed.outcome, "fallback");
  assert.equal(detailed.reason, "aborted");
  assert.deepEqual(calls, ["embed", "vector"]);
  assert.equal(detailed.timings.judgeMs, undefined);
});

test("rejected dependencies are explicit fallbacks instead of escaping the search request", async () => {
  const detailed = await searchProductsHybridDetailed(products, { query: "broken query" }, {
    dependencies: successfulDependencies({ judge: async () => { throw new Error("boom"); } }),
    timeoutMs: 100,
  });

  assert.equal(detailed.outcome, "fallback");
  assert.equal(detailed.reason, "judge-unavailable");
  assert.deepEqual(detailed.result.results, fallbackResult(products).results);
  assert.equal(detailed.result.approximate, true);
});

test("the production path does not buy an embedding when vector storage is unavailable", async () => {
  let embeddingCalls = 0;
  const detailed = await searchProductsHybridDetailed(products, { query: "offline query" }, {
    dependencies: {
      embed: async () => {
        embeddingCalls += 1;
        return [1];
      },
    },
    timeoutMs: 100,
  });

  assert.equal(detailed.outcome, "fallback");
  assert.equal(detailed.reason, "vector-unavailable");
  assert.equal(embeddingCalls, 0);
  assert.equal(detailed.timings.embeddingMs, undefined);
});

test("the real embedding request honors cancellation before and during fetch", async () => {
  const originalApiKey = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = "test-key";
  let fetchCalls = 0;
  try {
    const { embedSearchQuery } = loadEmbedding();
    const alreadyAborted = new AbortController();
    alreadyAborted.abort();
    globalThis.fetch = async () => {
      fetchCalls += 1;
      throw new Error("fetch must not start");
    };
    assert.equal(await embedSearchQuery("already cancelled", { signal: alreadyAborted.signal }), null);
    assert.equal(fetchCalls, 0);

    const controller = new AbortController();
    let observedAbort = false;
    globalThis.fetch = async (_url, init) => {
      fetchCalls += 1;
      return await new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => {
          observedAbort = true;
          reject(new DOMException("Aborted", "AbortError"));
        }, { once: true });
      });
    };
    const embeddingPromise = embedSearchQuery("cancel in flight", {
      signal: controller.signal,
      timeoutMs: 500,
    });
    setTimeout(() => controller.abort(), 10);
    assert.equal(await embeddingPromise, null);
    assert.equal(fetchCalls, 1);
    assert.equal(observedAbort, true);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalApiKey;
  }
});
