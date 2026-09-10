/**
 * Stress-regression run for the already-inspected 200-case final-blind v2 set.
 * This is deliberately NOT a blind metric. It is used only before freezing a
 * replacement blind set to decide whether the production candidate is ready.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EMBEDDING_PROVIDERS, loadLocalEnv } from "./cloud-search-providers.mjs";
import { FINAL_BLIND_V2_SET } from "./final-blind-v2-queries.mjs";
import { loadSemanticSearch } from "./load-search.mjs";
import { loadSearchProducts, productDocument } from "./search-catalog.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = path.join(rootDir, ".tmp", "cloud-search-cache");
const reportPath = path.join(rootDir, "reports", "search", "cloud-consumed-v2-report.json");
const HYBRID_POLICY = { threshold: 0.029287, relativeCutoff: 0.85 };
const VECTOR_POLICY = { threshold: 0.652671, relativeCutoff: 0.95 };
const MAX_RESULTS = 20;
const MAX_K = 5;
const PRECISION_TARGET = 0.6;

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

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function cached(key, create) {
  const filePath = path.join(cacheDir, `${sha256(JSON.stringify(key))}.json`);
  if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, "utf8"));
  const value = await create();
  writeJson(filePath, value);
  return value;
}

function unitVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return vector.map((value) => value / magnitude);
}

function cosine(left, right) {
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result += left[index] * right[index];
  return result;
}

function eligibleProducts(products, interpretation, engine) {
  const constraints = interpretation.constraints;
  const garments = new Set(constraints.garmentTypes.flatMap((term) => [...(GARMENT_FAMILIES[term] ?? [term])]));
  return products.filter((product) => {
    const price = Number(product.price_eur);
    if (constraints.minPrice !== undefined && price < constraints.minPrice) return false;
    if (constraints.maxPrice !== undefined && price > constraints.maxPrice) return false;
    if (constraints.availability === "in_stock" && product.availability !== "in_stock") return false;
    const terms = engine.buildProductTerms(product);
    if (constraints.excludedTerms.some((term) => terms.has(term))) return false;
    if (constraints.departments.some((term) => !terms.has(term))) return false;
    if (constraints.colors.length > 0 && !constraints.colors.some((term) => terms.has(term))) return false;
    if (garments.size > 0 && ![...garments].some((term) => terms.has(term))) return false;
    return true;
  });
}

function fuse(vectorRanked, graphMatches) {
  const scores = new Map();
  const add = (entries) => entries.forEach((entry, index) => {
    const id = entry.id ?? entry.product?.mock_product_id;
    scores.set(id, (scores.get(id) ?? 0) + 1 / (60 + index + 1));
  });
  add(vectorRanked);
  add(graphMatches);
  return [...scores].map(([id, score]) => ({ id, score }))
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

function scoreCase(testCase, ranked, policy) {
  const best = ranked[0]?.score ?? Number.NEGATIVE_INFINITY;
  const cutoff = Math.max(policy.threshold, best * policy.relativeCutoff);
  const returned = ranked.filter((entry) => entry.score >= cutoff).slice(0, MAX_RESULTS);
  const ids = returned.map((entry) => entry.id);
  const relevant = new Set(testCase.relevant);
  const positive = relevant.size > 0;
  const k = Math.min(MAX_K, relevant.size);
  const precisionAtK = positive
    ? ids.slice(0, k).filter((id) => relevant.has(id)).length / k
    : (ids.length === 0 ? 1 : 0);
  const recall = positive
    ? ids.filter((id) => relevant.has(id)).length / relevant.size
    : (ids.length === 0 ? 1 : 0);
  const requiredWindow = Math.max(k, testCase.mustRank?.length ?? 0);
  const missingRequired = (testCase.mustRank ?? []).filter((id) => !ids.slice(0, requiredWindow).includes(id));
  const forbiddenFound = (testCase.forbiddenTop ?? []).filter((id) => ids.slice(0, testCase.forbiddenTopK ?? MAX_K).includes(id));
  const overCap = testCase.maxResults !== undefined && ids.length > testCase.maxResults;
  const passed = positive
    ? precisionAtK >= PRECISION_TARGET && missingRequired.length === 0 && forbiddenFound.length === 0 && !overCap
    : ids.length === 0;
  return {
    ...testCase,
    passed,
    precisionAtK,
    recall,
    returnedCount: ids.length,
    missingRequired,
    forbiddenFound,
    relevantPositions: Object.fromEntries(testCase.relevant.map((id) => [id, ids.indexOf(id) === -1 ? null : ids.indexOf(id) + 1])),
    actual: returned,
  };
}

function aggregate(rows) {
  const passed = rows.filter((row) => row.passed).length;
  const positives = rows.filter((row) => row.relevant.length > 0);
  return {
    total: rows.length,
    passed,
    passRate: passed / rows.length,
    meanPrecisionAtK: positives.reduce((sum, row) => sum + row.precisionAtK, 0) / positives.length,
    meanRecall: positives.reduce((sum, row) => sum + row.recall, 0) / positives.length,
    meanCandidateRecallAt40: positives.reduce((sum, row) => sum + (row.candidateRecallAt40 ?? 0), 0) / positives.length,
    positivesWithRelevantAt40: positives.filter((row) => row.hasRelevantAt40).length,
    failedCaseIds: rows.filter((row) => !row.passed).map((row) => row.id),
  };
}

async function main() {
  const provider = EMBEDDING_PROVIDERS.gemini;
  const products = loadSearchProducts(rootDir);
  const engine = loadSemanticSearch();
  const documents = products.map(productDocument);
  const queries = FINAL_BLIND_V2_SET.map((item) => item.query);
  const productVectors = (await cached({ provider: "gemini", model: provider.model, dimensions: provider.dimensions, inputType: "document", contentSha256: sha256(JSON.stringify(documents)), kind: "embedding" }, () => provider.embed(documents, "document"))).map(unitVector);
  console.log(`Embedding ${queries.length} inspected v2 queries (this is not a blind run)`);
  const queryVectors = (await cached({ provider: "gemini", model: provider.model, dimensions: provider.dimensions, inputType: "query", contentSha256: sha256(JSON.stringify(queries)), kind: "embedding" }, () => provider.embed(queries, "query"))).map(unitVector);

  const pairedRows = FINAL_BLIND_V2_SET.map((testCase, queryIndex) => {
    const interpretation = engine.interpretQuery(testCase.query);
    const eligible = eligibleProducts(products, interpretation, engine);
    const eligibleIds = new Set(eligible.map((product) => product.mock_product_id));
    const vectorRankedAll = products.map((product, productIndex) => ({
      id: product.mock_product_id,
      score: cosine(productVectors[productIndex], queryVectors[queryIndex]),
    })).sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
    const vectorRanked = vectorRankedAll.filter((entry) => eligibleIds.has(entry.id));
    const graph = engine.semanticSearch(eligible, testCase.query).matches;
    const relevantAt40 = testCase.relevant.filter((id) => vectorRankedAll.slice(0, 40).some((entry) => entry.id === id));
    const retrieval = {
      candidateRecallAt40: testCase.relevant.length > 0 ? relevantAt40.length / testCase.relevant.length : 1,
      hasRelevantAt40: testCase.relevant.length === 0 || relevantAt40.length > 0,
      candidateTop40: vectorRankedAll.slice(0, 40),
    };
    return {
      vector: { ...scoreCase(testCase, vectorRanked, VECTOR_POLICY), ...retrieval },
      hybrid: { ...scoreCase(testCase, fuse(vectorRanked, graph), HYBRID_POLICY), ...retrieval },
    };
  });
  const vectorRows = pairedRows.map((row) => row.vector);
  const hybridRows = pairedRows.map((row) => row.hybrid);
  const byCategory = Object.fromEntries([...new Set(hybridRows.map((row) => row.category))].sort().map((category) => [category, {
    vector: aggregate(vectorRows.filter((row) => row.category === category)),
    hybrid: aggregate(hybridRows.filter((row) => row.category === category)),
  }]));
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    purpose: "Inspected final-blind v2 consumed as a stress-regression set; never an unseen metric",
    model: provider.model,
    dimensions: provider.dimensions,
    policy: { vector: VECTOR_POLICY, hybrid: HYBRID_POLICY },
    summary: { vector: aggregate(vectorRows), hybrid: aggregate(hybridRows) },
    byCategory,
    cases: pairedRows,
  };
  writeJson(reportPath, report);
  console.log(`Vector passed ${report.summary.vector.passed}/${report.summary.vector.total} (${(report.summary.vector.passRate * 100).toFixed(1)}%)`);
  console.log(`Hybrid passed ${report.summary.hybrid.passed}/${report.summary.hybrid.total} (${(report.summary.hybrid.passRate * 100).toFixed(1)}%)`);
  console.log(`Unfiltered vector top-40 contains a relevant item for ${report.summary.vector.positivesWithRelevantAt40} positives; mean relevant recall ${(report.summary.vector.meanCandidateRecallAt40 * 100).toFixed(1)}%`);
  console.log(`Hybrid failed: ${report.summary.hybrid.failedCaseIds.join(", ") || "none"}`);
  console.log(`Report: ${path.relative(rootDir, reportPath)}`);
}

await main();
