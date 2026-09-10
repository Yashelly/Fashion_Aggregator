/**
 * Cloud embedding/reranker bake-off for WEFT.
 *
 * This command intentionally imports only DEV_SET and REGRESSION_SET. The
 * frozen final blind sets are not reachable from this file, so model selection
 * cannot accidentally inspect or optimise against their failures.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSemanticSearch } from "./load-search.mjs";
import { DEV_SET, REGRESSION_SET } from "./search-queries.mjs";
import { loadSearchProducts, productDocument, rerankDocument } from "./search-catalog.mjs";
import {
  EMBEDDING_PROVIDERS,
  RERANK_PROVIDERS,
  loadLocalEnv,
} from "./cloud-search-providers.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = path.join(rootDir, ".tmp", "cloud-search-cache");
const defaultReportPath = path.join(rootDir, "reports", "search", "cloud-bakeoff-report.json");
const MAX_RETRIEVAL_RESULTS = 20;
const RERANK_CANDIDATES = 30;
const MAX_K = 5;
const PRECISION_TARGET = 0.6;
const RELATIVE_CUTOFFS = [0, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95];

const GARMENT_FAMILIES = {
  accessories: new Set(["accessories", "bag", "tote", "backpack", "crossbody", "belt", "cap", "scarf", "socks", "jewelry"]),
  bag: new Set(["bag", "tote", "backpack", "crossbody"]),
  jacket: new Set(["jacket", "coat", "parka", "windbreaker", "overshirt", "vest"]),
  sweater: new Set(["sweater", "cardigan", "knitwear"]),
  outerwear: new Set(["outerwear", "jacket", "coat", "parka", "windbreaker", "overshirt", "vest"]),
  shoes: new Set(["shoes", "sneakers", "boots"]),
  top: new Set(["top", "tee", "t-shirt", "tank", "sweatshirt"]),
  tracksuit: new Set(["jacket", "joggers", "sweatpants"]),
  trousers: new Set(["trousers", "jeans", "joggers", "sweatpants", "leggings"]),
};

loadLocalEnv(rootDir);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function parseArgs(args) {
  const value = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  return {
    providers: (value("providers") ?? "cohere,gemini,voyage").split(",").filter(Boolean),
    rerankers: (value("rerankers") ?? "").split(",").filter(Boolean),
    reportPath: value("report") ? path.resolve(rootDir, value("report")) : defaultReportPath,
    refresh: args.includes("--refresh"),
  };
}

function unitVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(magnitude) || magnitude === 0) throw new Error("Embedding vector has zero/invalid magnitude");
  return vector.map((value) => value / magnitude);
}

function cosine(left, right) {
  let total = 0;
  for (let index = 0; index < left.length; index += 1) total += left[index] * right[index];
  return total;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporaryPath, filePath);
}

async function cached(keyParts, refresh, create) {
  const cacheKey = sha256(JSON.stringify(keyParts));
  const cachePath = path.join(cacheDir, `${cacheKey}.json`);
  if (!refresh && fs.existsSync(cachePath)) return JSON.parse(fs.readFileSync(cachePath, "utf8"));
  const value = await create();
  writeJson(cachePath, value);
  return value;
}

function filterProducts(products, interpretation, engine) {
  const constraints = interpretation.constraints;
  return products.filter((product) => {
    const price = Number(product.price_eur);
    if (constraints.minPrice !== undefined && price < constraints.minPrice) return false;
    if (constraints.maxPrice !== undefined && price > constraints.maxPrice) return false;
    if (constraints.availability === "in_stock" && product.availability !== "in_stock") return false;

    const productTerms = engine.buildProductTerms(product);
    if (constraints.excludedTerms.some((term) => productTerms.has(term))) return false;
    if (constraints.departments.some((term) => !productTerms.has(term))) return false;
    if (constraints.colors.length > 0 && !constraints.colors.some((term) => productTerms.has(term))) return false;
    if (constraints.garmentTypes.length > 0) {
      const familyRoot = constraints.garmentTypes.find((term) => GARMENT_FAMILIES[term]);
      const acceptable = familyRoot
        ? GARMENT_FAMILIES[familyRoot]
        : new Set(constraints.garmentTypes);
      if (![...acceptable].some((term) => productTerms.has(term))) return false;
    }
    return true;
  });
}

function rankedByEmbedding(products, productVectors, queryVector, eligibleIds) {
  return products
    .map((product, index) => ({
      id: product.mock_product_id,
      title: product.title,
      score: cosine(productVectors[index], queryVector),
    }))
    .filter((entry) => eligibleIds.has(entry.id))
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

function rankedByReciprocalRankFusion(vectorRanked, graphMatches) {
  const scores = new Map();
  const titles = new Map(vectorRanked.map((entry) => [entry.id, entry.title]));
  const addLane = (entries) => {
    entries.forEach((entry, index) => {
      const id = entry.id ?? entry.product?.mock_product_id;
      if (!id) return;
      if (entry.product?.title) titles.set(id, entry.product.title);
      scores.set(id, (scores.get(id) ?? 0) + 1 / (60 + index + 1));
    });
  };
  addLane(vectorRanked);
  addLane(graphMatches);
  return [...scores].map(([id, score]) => ({ id, title: titles.get(id) ?? id, score }))
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

function positionOf(ranked, id) {
  const index = ranked.findIndex((entry) => entry.id === id);
  return index === -1 ? null : index + 1;
}

function ndcgAt(ranked, relevant, limit) {
  const dcg = ranked.slice(0, limit).reduce(
    (sum, entry, index) => sum + (relevant.has(entry.id) ? 1 / Math.log2(index + 2) : 0),
    0,
  );
  const idealCount = Math.min(limit, relevant.size);
  const ideal = Array.from({ length: idealCount }).reduce(
    (sum, _value, index) => sum + 1 / Math.log2(index + 2),
    0,
  );
  return ideal === 0 ? 1 : dcg / ideal;
}

function rowMetrics(testCase, ranked, candidates) {
  const relevant = new Set(testCase.relevant);
  const positive = relevant.size > 0;
  const top20 = ranked.slice(0, 20);
  const firstRank = positive
    ? Math.min(...testCase.relevant.map((id) => positionOf(ranked, id) ?? Number.POSITIVE_INFINITY))
    : null;
  const candidateRelevant = testCase.relevant.filter((id) => candidates.has(id)).length;
  return {
    id: testCase.id,
    query: testCase.query,
    intent: testCase.intent,
    positive,
    relevant: testCase.relevant,
    mustRank: testCase.mustRank ?? [],
    maxResults: testCase.maxResults,
    forbiddenTop: testCase.forbiddenTop ?? [],
    forbiddenTopK: testCase.forbiddenTopK ?? MAX_K,
    candidateCount: candidates.size,
    candidateRecall: positive ? candidateRelevant / relevant.size : 1,
    recallAt20: positive
      ? top20.filter((entry) => relevant.has(entry.id)).length / relevant.size
      : 1,
    ndcgAt10: positive ? ndcgAt(ranked, relevant, 10) : 1,
    reciprocalRank: positive && Number.isFinite(firstRank) ? 1 / firstRank : positive ? 0 : 1,
    firstRelevantRank: positive && Number.isFinite(firstRank) ? firstRank : null,
    topScore: ranked[0]?.score ?? null,
    relevantPositions: Object.fromEntries(testCase.relevant.map((id) => [id, positionOf(ranked, id)])),
    top: ranked.slice(0, RERANK_CANDIDATES),
  };
}

function casePass(row, policy) {
  const relativeThreshold = row.topScore === null ? Number.POSITIVE_INFINITY : row.topScore * policy.relativeCutoff;
  const effectiveThreshold = Math.max(policy.threshold, relativeThreshold);
  const returned = row.top.filter((entry) => entry.score >= effectiveThreshold).slice(0, MAX_RETRIEVAL_RESULTS);
  const ranked = returned.map((entry) => entry.id);
  const relevant = new Set(row.relevant);
  if (!row.positive) return returned.length === 0;

  const k = Math.min(MAX_K, relevant.size);
  const precision = ranked.slice(0, k).filter((id) => relevant.has(id)).length / k;
  const requiredWindow = Math.max(k, row.mustRank.length);
  const missingRequired = row.mustRank.some((id) => !ranked.slice(0, requiredWindow).includes(id));
  const overCap = row.maxResults !== undefined && returned.length > row.maxResults;
  const forbidden = row.forbiddenTop.some((id) =>
    ranked.slice(0, row.forbiddenTopK).includes(id),
  );
  return precision >= PRECISION_TARGET && !missingRequired && !overCap && !forbidden;
}

function calibrateThreshold(devRows) {
  const candidates = new Set([-1, 1]);
  for (const row of devRows) {
    for (const entry of row.top) {
      candidates.add(entry.score);
      candidates.add(entry.score + Number.EPSILON);
    }
  }

  let best = { threshold: -1, relativeCutoff: 0, passed: -1 };
  for (const relativeCutoff of RELATIVE_CUTOFFS) {
    for (const threshold of [...candidates].sort((left, right) => left - right)) {
      const policy = { threshold, relativeCutoff };
      const passed = devRows.filter((row) => casePass(row, policy)).length;
      if (
        passed > best.passed ||
        (passed === best.passed && relativeCutoff > best.relativeCutoff) ||
        (passed === best.passed && relativeCutoff === best.relativeCutoff && threshold > best.threshold)
      ) {
        best = { ...policy, passed };
      }
    }
  }
  return { threshold: best.threshold, relativeCutoff: best.relativeCutoff };
}

function mean(values) {
  return values.length === 0 ? 1 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function summarise(rows, policy) {
  const positives = rows.filter((row) => row.positive);
  const negatives = rows.filter((row) => !row.positive);
  const passed = rows.filter((row) => casePass(row, policy));
  return {
    total: rows.length,
    positive: positives.length,
    negative: negatives.length,
    threshold: Number(policy.threshold.toFixed(8)),
    relativeCutoff: policy.relativeCutoff,
    passed: passed.length,
    passRate: passed.length / rows.length,
    meanCandidateRecall: mean(positives.map((row) => row.candidateRecall)),
    meanRecallAt20: mean(positives.map((row) => row.recallAt20)),
    meanNdcgAt10: mean(positives.map((row) => row.ndcgAt10)),
    meanReciprocalRank: mean(positives.map((row) => row.reciprocalRank)),
    negativeTrueRejectRate: negatives.length === 0
      ? 1
      : negatives.filter((row) => casePass(row, policy)).length / negatives.length,
    failedCaseIds: rows.filter((row) => !casePass(row, policy)).map((row) => row.id),
  };
}

async function embedWithCache(providerName, provider, texts, inputType, refresh) {
  return cached(
    {
      kind: "embedding",
      provider: providerName,
      model: provider.model,
      dimensions: provider.dimensions,
      inputType,
      contentSha256: sha256(JSON.stringify(texts)),
    },
    refresh,
    () => provider.embed(texts, inputType),
  );
}

async function rerankWithCache(rerankerName, reranker, query, documents, ids, refresh) {
  return cached(
    {
      kind: "rerank",
      reranker: rerankerName,
      model: reranker.model,
      query,
      documentIds: ids,
      contentSha256: sha256(JSON.stringify(documents)),
    },
    refresh,
    () => reranker.rerank(query, documents),
  );
}

async function evaluateEmbeddingProvider(providerName, provider, products, engine, refresh) {
  const cases = [...DEV_SET, ...REGRESSION_SET].map((testCase, index) => ({
    ...testCase,
    id: testCase.id ?? `${index < DEV_SET.length ? "DEV" : "REG"}-${String(index < DEV_SET.length ? index + 1 : index - DEV_SET.length + 1).padStart(3, "0")}`,
    set: index < DEV_SET.length ? "dev" : "regression",
  }));
  const documents = products.map(productDocument);
  const queries = cases.map((testCase) => testCase.query);

  console.log(`[${providerName}] embedding ${documents.length} products`);
  const productVectors = (await embedWithCache(providerName, provider, documents, "document", refresh)).map(unitVector);
  console.log(`[${providerName}] embedding ${queries.length} DEV/REGRESSION queries`);
  const queryVectors = (await embedWithCache(providerName, provider, queries, "query", refresh)).map(unitVector);

  const vectorRows = [];
  const hybridRows = [];
  cases.forEach((testCase, index) => {
    const interpretation = engine.interpretQuery(testCase.query);
    const eligibleProducts = filterProducts(products, interpretation, engine);
    const eligible = new Set(eligibleProducts.map((product) => product.mock_product_id));
    const vectorRanked = rankedByEmbedding(products, productVectors, queryVectors[index], eligible);
    const graphRanked = engine.semanticSearch(eligibleProducts, testCase.query).matches;
    const hybridRanked = rankedByReciprocalRankFusion(vectorRanked, graphRanked);
    const shared = {
      set: testCase.set,
      interpretation,
    };
    vectorRows.push({ ...rowMetrics(testCase, vectorRanked, eligible), ...shared });
    hybridRows.push({ ...rowMetrics(testCase, hybridRanked, eligible), ...shared });
  });

  const buildResult = (rows, mode) => {
    const devRows = rows.filter((row) => row.set === "dev");
    const regressionRows = rows.filter((row) => row.set === "regression");
    const policy = calibrateThreshold(devRows);
    return {
      mode,
      calibration: "one global absolute threshold plus one relative-to-best cutoff selected on DEV only; applied unchanged to REGRESSION",
      summary: {
        dev: summarise(devRows, policy),
        regression: summarise(regressionRows, policy),
      },
      cases: rows,
    };
  };
  const vector = buildResult(vectorRows, "vector-only");
  const hybrid = buildResult(hybridRows, "equal-weight RRF over vector retrieval and the existing deterministic concept graph");
  return {
    provider: providerName,
    model: provider.model,
    dimensions: provider.dimensions,
    vector,
    hybrid,
    cases: hybridRows,
    productVectors,
  };
}

async function evaluateReranker(rerankerName, reranker, embeddingResult, products, refresh) {
  console.log(`[${embeddingResult.provider}+${rerankerName}] reranking DEV/REGRESSION top ${RERANK_CANDIDATES}`);
  const productsById = new Map(products.map((product) => [product.mock_product_id, product]));
  const rows = [];
  let completed = 0;
  for (const baseRow of embeddingResult.cases) {
    const candidateEntries = baseRow.top.slice(0, RERANK_CANDIDATES);
    if (candidateEntries.length === 0) {
      rows.push({ ...baseRow, top: [], topScore: null, relevantPositions: {} });
      continue;
    }
    const ids = candidateEntries.map((entry) => entry.id);
    const documents = ids.map((id) => rerankDocument(productsById.get(id)));
    const results = await rerankWithCache(
      rerankerName,
      reranker,
      baseRow.query,
      documents,
      ids,
      refresh,
    );
    const ranked = results
      .map((entry) => ({
        id: ids[entry.index],
        title: productsById.get(ids[entry.index]).title,
        score: entry.score,
      }))
      .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
    const eligible = new Set(ids);
    rows.push({
      ...baseRow,
      ...rowMetrics(baseRow, ranked, eligible),
      set: baseRow.set,
      interpretation: baseRow.interpretation,
    });
    completed += 1;
    if (completed % 10 === 0) console.log(`  reranked ${completed}/${embeddingResult.cases.length}`);
  }

  const devRows = rows.filter((row) => row.set === "dev");
  const regressionRows = rows.filter((row) => row.set === "regression");
  const policy = calibrateThreshold(devRows);
  return {
    embeddingProvider: embeddingResult.provider,
    embeddingModel: embeddingResult.model,
    reranker: rerankerName,
    rerankerModel: reranker.model,
    calibration: "one global reranker threshold plus one relative-to-best cutoff selected on DEV only; applied unchanged to REGRESSION",
    summary: {
      dev: summarise(devRows, policy),
      regression: summarise(regressionRows, policy),
    },
    cases: rows,
  };
}

function printableSummary(label, result) {
  const dev = result.summary.dev;
  const regression = result.summary.regression;
  console.log(label);
  console.log(`  DEV        pass ${dev.passed}/${dev.total} (${(dev.passRate * 100).toFixed(1)}%)  R@20 ${dev.meanRecallAt20.toFixed(3)}  nDCG@10 ${dev.meanNdcgAt10.toFixed(3)}`);
  console.log(`  REGRESSION pass ${regression.passed}/${regression.total} (${(regression.passRate * 100).toFixed(1)}%)  R@20 ${regression.meanRecallAt20.toFixed(3)}  nDCG@10 ${regression.meanNdcgAt10.toFixed(3)}`);
  console.log(`  cutoff absolute=${dev.threshold.toFixed(6)} relative=${dev.relativeCutoff.toFixed(2)} (DEV-only calibration); negative reject ${(regression.negativeTrueRejectRate * 100).toFixed(1)}%`);
}

async function main(options) {
  for (const name of options.providers) {
    if (!EMBEDDING_PROVIDERS[name]) throw new Error(`Unknown embedding provider: ${name}`);
  }
  for (const name of options.rerankers) {
    if (!RERANK_PROVIDERS[name]) throw new Error(`Unknown reranker: ${name}`);
  }

  const products = loadSearchProducts(rootDir);
  const engine = loadSemanticSearch();
  const catalogSha256 = sha256(JSON.stringify(products.map(productDocument)));
  const embeddingResults = [];
  for (const providerName of options.providers) {
    const result = await evaluateEmbeddingProvider(
      providerName,
      EMBEDDING_PROVIDERS[providerName],
      products,
      engine,
      options.refresh,
    );
    embeddingResults.push(result);
    printableSummary(`${providerName}/${result.model} — vector retrieval`, result.vector);
    printableSummary(`${providerName}/${result.model} — hybrid RRF`, result.hybrid);
  }

  const rerankerResults = [];
  for (const embeddingResult of embeddingResults) {
    for (const rerankerName of options.rerankers) {
      const result = await evaluateReranker(
        rerankerName,
        RERANK_PROVIDERS[rerankerName],
        embeddingResult,
        products,
        options.refresh,
      );
      rerankerResults.push(result);
      printableSummary(
        `${embeddingResult.provider}/${embeddingResult.model} + ${rerankerName}/${result.rerankerModel}`,
        result,
      );
    }
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    purpose: "Cloud model selection on inspected development data; never a final blind metric",
    leakageBoundary: "Only DEV_SET and REGRESSION_SET are imported. No blind-set module is imported or evaluated.",
    catalogSha256,
    catalogSize: products.length,
    setSizes: { dev: DEV_SET.length, regression: REGRESSION_SET.length },
    retrieval: embeddingResults.map(({ productVectors: _vectors, ...result }) => result),
    reranking: rerankerResults,
  };
  writeJson(options.reportPath, report);
  console.log(`Report: ${path.relative(rootDir, options.reportPath)}`);
}

await main(parseArgs(process.argv.slice(2)));
