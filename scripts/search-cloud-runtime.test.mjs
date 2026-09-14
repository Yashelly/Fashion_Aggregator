import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function product(mock_product_id, overrides = {}) {
  return {
    mock_product_id,
    title: "Black Hoodie",
    category: "tops",
    subcategory: "hoodie",
    brand: "Demo",
    gender: "unisex",
    color: "black",
    style_tags: "",
    old_price_eur: "",
    availability: "in_stock",
    price_eur: "20",
    public_store_id: "demo-store-01",
    size_options: "M|L",
    motif: "",
    surface: "",
    visual_details: "",
    visual_description: "",
    ...overrides,
  };
}

const products = [
  product("P-1", { motif: "stars", style_tags: "wool", old_price_eur: "30", price_eur: "10" }),
  product("P-2"),
];

function fallbackResult(inputProducts, params = {}) {
  const approximate = params.query?.includes("approximate") ?? false;
  return {
    results: [inputProducts[1]],
    relevance: new Map([["P-2", 0.5]]),
    interpretation: { source: "deterministic" },
    approximate,
    relaxedConstraints: approximate ? ["style"] : [],
  };
}

function loadHybridSearch() {
  const deadlineSource = fs.readFileSync(path.join(rootDir, "lib", "search-deadline.ts"), "utf8");
  const semanticSource = fs.readFileSync(path.join(rootDir, "lib", "semantic-search.ts"), "utf8");
  const hybridSource = fs.readFileSync(path.join(rootDir, "lib", "hybrid-search.ts"), "utf8");
  const compilerOptions = { module: "CommonJS", target: "ES2022" };
  const transpile = (source) => require("typescript").transpileModule(source, { compilerOptions }).outputText;

  const deadlineModule = { exports: {} };
  new Function("exports", "module", "require", transpile(deadlineSource))(
    deadlineModule.exports,
    deadlineModule,
    (specifier) => specifier === "server-only" ? {} : require(specifier),
  );

  const semanticModule = { exports: {} };
  new Function("exports", "module", "require", transpile(semanticSource))(
    semanticModule.exports,
    semanticModule,
    require,
  );

  const moduleScope = { exports: {} };
  const localRequire = (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "@/lib/search-deadline") return deadlineModule.exports;
    if (specifier === "@/lib/mock-products") {
      return {
        filterProducts: (inputProducts, params = {}) => inputProducts.filter((candidate) => {
          if (params.store && candidate.public_store_id !== params.store) return false;
          if (params.category && candidate.category !== params.category) return false;
          if (params.color && candidate.color !== params.color) return false;
          if (params.size && !candidate.size_options.split("|").includes(params.size)) return false;
          if (params.department && candidate.gender !== params.department) return false;
          if (params.sale === "on" && !candidate.old_price_eur) return false;
          if (params.availability && candidate.availability !== params.availability) return false;
          if (params.minPrice !== undefined && Number(candidate.price_eur) < Number(params.minPrice)) return false;
          if (params.maxPrice !== undefined && Number(candidate.price_eur) > Number(params.maxPrice)) return false;
          return true;
        }),
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
      return semanticModule.exports;
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
  assert.equal(detailed.result.approximate, false);
  assert.deepEqual(detailed.result.relaxedConstraints, []);
});

test("cloud failure preserves an approximate fallback classification", async () => {
  const detailed = await searchProductsHybridDetailed(products, { query: "approximate query" }, {
    dependencies: successfulDependencies({ embed: async () => null }),
    timeoutMs: 100,
  });

  assert.equal(detailed.outcome, "fallback");
  assert.equal(detailed.reason, "embedding-unavailable");
  assert.equal(detailed.result.approximate, true);
  assert.deepEqual(detailed.result.relaxedConstraints, ["style"]);
});

test("a valid judge result remains a success when it satisfies deterministic constraints", async () => {
  const detailed = await searchProductsHybridDetailed(products, { query: "black hoodie" }, {
    dependencies: successfulDependencies({ judge: async () => ["P-2"] }),
    timeoutMs: 100,
  });

  assert.equal(detailed.outcome, "success");
  assert.equal(detailed.reason, "judge-complete");
  assert.deepEqual(detailed.result.results, [products[1]]);
  assert.equal(detailed.result.approximate, false);
});

test("judge near-misses cannot be labelled exact", async () => {
  const detailed = await searchProductsHybridDetailed(products, {
    query: "black wool hoodie with stars",
  }, {
    dependencies: successfulDependencies({ judge: async () => ["P-2"] }),
    timeoutMs: 100,
  });

  assert.equal(detailed.outcome, "success");
  assert.deepEqual(detailed.result.results, [products[1]]);
  assert.equal(detailed.result.approximate, true);
  assert.deepEqual(detailed.result.relaxedConstraints, ["wool", "star"]);
});

test("judge results are post-validated against query constraints and explicit facets", async () => {
  const wrongFacets = [
    product("wrong-store", { public_store_id: "demo-store-02", old_price_eur: "30", price_eur: "10", motif: "stars", style_tags: "wool" }),
    product("wrong-category", { category: "bottoms", old_price_eur: "30", price_eur: "10", motif: "stars", style_tags: "wool" }),
    product("wrong-color", { color: "blue", old_price_eur: "30", price_eur: "10", motif: "stars", style_tags: "wool" }),
    product("wrong-size", { size_options: "S", old_price_eur: "30", price_eur: "10", motif: "stars", style_tags: "wool" }),
    product("wrong-department", { gender: "men", old_price_eur: "30", price_eur: "10", motif: "stars", style_tags: "wool" }),
    product("wrong-sale", { price_eur: "10", motif: "stars", style_tags: "wool" }),
    product("wrong-availability", { availability: "out_of_stock", old_price_eur: "30", price_eur: "10", motif: "stars", style_tags: "wool" }),
    product("below-price", { old_price_eur: "30", price_eur: "4", motif: "stars", style_tags: "wool" }),
    product("above-price", { old_price_eur: "30", price_eur: "16", motif: "stars", style_tags: "wool" }),
  ];
  const excluded = product("excluded", {
    motif: "stars",
    style_tags: "wool",
    visual_details: "zip",
    old_price_eur: "30",
    price_eur: "10",
  });
  const candidates = [...products, ...wrongFacets, excluded];
  const detailed = await searchProductsHybridDetailed(candidates, {
    query: "black wool hoodie with stars not zip",
    store: "demo-store-01",
    category: "tops",
    color: "black",
    size: "M",
    department: "unisex",
    sale: "on",
    availability: "in_stock",
    minPrice: 5,
    maxPrice: 15,
  }, {
    dependencies: successfulDependencies({
      judge: async () => [...wrongFacets.map((candidate) => candidate.mock_product_id), "excluded", "P-2", "P-1"],
    }),
    timeoutMs: 100,
  });

  assert.equal(detailed.outcome, "success");
  assert.deepEqual(detailed.result.results, [products[0]]);
  assert.equal(detailed.result.approximate, false);
  assert.deepEqual(detailed.result.relaxedConstraints, []);
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
  assert.equal(detailed.result.approximate, false);
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
  assert.equal(detailed.result.approximate, false);
  assert.deepEqual(detailed.result.relaxedConstraints, []);
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
