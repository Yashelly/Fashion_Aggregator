/**
 * Deterministic semantic-search evaluation harness.
 *
 * Development mode (`npm run test:search`) gates only the tunable DEV set and
 * the compact inspected REGRESSION tripwire. The broader 200-case former blind
 * set is intentionally diagnostic-only after it was consumed for tuning.
 */

import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsvRecords } from "./csv.mjs";
import {
  DEV_SET,
  HISTORICAL_BLIND_SET_2026_08_27,
  REGRESSION_SET,
} from "./search-queries.mjs";
import { CONSUMED_FINAL_BLIND_SET_2026_09_07 } from "./final-blind-queries.mjs";
import { FINAL_BLIND_V2_SET } from "./final-blind-v2-queries.mjs";
import { loadSemanticSearch } from "./load-search.mjs";
import { validateBlindSet } from "./validate-blind-set.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRECISION_TARGET = 0.6;
const DEV_PASS_RATE_TARGET = 0.8;
const REGRESSION_PASS_RATE_TARGET = 0.8;
const MAX_K = 5;
const FINAL_V2_MANIFEST_PATH = path.join(rootDir, "scripts", "final-blind-v2-manifest.json");
const FINAL_V2_REPORT_PATH = path.join(rootDir, "reports", "search", "final-blind-v2-report.json");

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function canonicalText(value) {
  return value.toString("utf8").replace(/\r\n?/g, "\n");
}

function fileHash(relativePath) {
  return sha256(canonicalText(fs.readFileSync(path.join(rootDir, relativePath))));
}

function readCsv(fileName) {
  const filePath = path.join(rootDir, "data", fileName);
  if (!fs.existsSync(filePath)) return [];
  return parseCsvRecords(fs.readFileSync(filePath, "utf8"));
}

function loadProducts() {
  const attributes = new Map(readCsv("product_attributes.csv").map((row) => [row.mock_product_id, row]));
  return readCsv("mock_products.csv")
    .filter((product) => product.source_status === "mock_not_live")
    .map((product) => {
      const visual = attributes.get(product.mock_product_id);
      return {
        ...product,
        motif: visual?.motif ?? "",
        surface: visual?.surface ?? "",
        visual_details: visual?.details ?? "",
        visual_description: visual?.visual_description ?? "",
      };
    });
}

function positionOf(matches, productId) {
  const index = matches.findIndex((match) => match.id === productId);
  return index === -1 ? null : index + 1;
}

function scoreSet(name, queries, { semanticSearch, interpretQuery }, products) {
  return queries.map((testCase, index) => {
    const { minPrice, maxPrice } = interpretQuery(testCase.query);
    const candidates = minPrice !== undefined || maxPrice !== undefined
      ? products.filter((product) => {
        const price = Number(product.price_eur);
        return (minPrice === undefined || price >= minPrice)
          && (maxPrice === undefined || price <= maxPrice);
      })
      : products;
    const search = semanticSearch(candidates, testCase.query);
    const matches = search.matches.map((match) => ({
      id: match.product.mock_product_id,
      title: match.product.title,
      score: Number(match.score.toFixed(6)),
      matchedTerms: [...match.matchedTerms],
    }));
    const ranked = matches.map((match) => match.id);
    const relevant = new Set(testCase.relevant);
    const isNegative = relevant.size === 0;
    const k = isNegative ? 0 : Math.min(MAX_K, relevant.size);
    const topK = ranked.slice(0, k);
    const overCap = testCase.maxResults !== undefined && ranked.length > testCase.maxResults;
    const precision = isNegative
      ? (overCap ? 0 : 1)
      : topK.filter((id) => relevant.has(id)).length / k;
    const recall = isNegative
      ? 1
      : ranked.filter((id) => relevant.has(id)).length / relevant.size;
    const requiredWindow = Math.max(k, testCase.mustRank?.length ?? 0);
    const missingRequired = (testCase.mustRank ?? []).filter(
      (id) => !ranked.slice(0, requiredWindow).includes(id),
    );
    const forbiddenTopK = testCase.forbiddenTopK ?? MAX_K;
    const forbiddenTopHits = (testCase.forbiddenTop ?? []).filter((id) =>
      ranked.slice(0, forbiddenTopK).includes(id),
    );
    const passed = precision >= PRECISION_TARGET
      && missingRequired.length === 0
      && !overCap
      && forbiddenTopHits.length === 0;

    return {
      ...testCase,
      id: testCase.id ?? `${name.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
      set: name,
      k,
      precision: Number(precision.toFixed(6)),
      recall: Number(recall.toFixed(6)),
      returned: ranked.length,
      passed,
      missingRequired,
      overCap,
      forbiddenTopHits,
      relevantPositions: Object.fromEntries(testCase.relevant.map((id) => [id, positionOf(matches, id)])),
      requiredPositions: Object.fromEntries((testCase.mustRank ?? []).map((id) => [id, positionOf(matches, id)])),
      matches,
      interpretation: search.interpretation,
    };
  });
}

function aggregate(rows) {
  const passCount = rows.filter((row) => row.passed).length;
  return {
    total: rows.length,
    passed: passCount,
    failed: rows.length - passCount,
    passRate: rows.length === 0 ? 1 : Number((passCount / rows.length).toFixed(6)),
    meanPrecisionAtK: rows.length === 0 ? 1 : Number((rows.reduce((sum, row) => sum + row.precision, 0) / rows.length).toFixed(6)),
    meanRecall: rows.length === 0 ? 1 : Number((rows.reduce((sum, row) => sum + row.recall, 0) / rows.length).toFixed(6)),
    failedCaseIds: rows.filter((row) => !row.passed).map((row) => row.id),
  };
}

function grouped(rows, field) {
  const groups = new Map();
  for (const row of rows) {
    const key = row[field] ?? "unspecified";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return Object.fromEntries([...groups].sort(([left], [right]) => left.localeCompare(right)).map(
    ([key, groupRows]) => [key, aggregate(groupRows)],
  ));
}

function printRow(row) {
  console.log(`${row.passed ? "PASS" : "FAIL"}  ${row.id}  ${row.query}  [${row.category ?? row.intent}; ${row.difficulty ?? "n/a"}]`);
  console.log(`      expected: ${row.expectedOutcome ?? row.intent}`);
  console.log(`      relevant: ${row.relevant.join(", ") || "(none; expect no results)"}`);
  console.log(`      actual:   ${row.matches.slice(0, MAX_K).map((match, index) => `${index + 1}:${match.id}@${match.score.toFixed(3)}`).join(", ") || "(none)"}`);
  console.log(`      precision@${row.k} ${row.precision.toFixed(2)}  recall ${row.recall.toFixed(2)}  returned ${row.returned}`);
  console.log(`      positions: ${JSON.stringify(row.relevantPositions)}`);
  if (row.missingRequired.length > 0) console.log(`      missing required: ${row.missingRequired.join(", ")}`);
  if (row.overCap) console.log(`      too many results: ${row.returned} returned, cap is ${row.maxResults}`);
  if (row.forbiddenTopHits.length > 0) console.log(`      forbidden in top ${row.forbiddenTopK ?? MAX_K}: ${row.forbiddenTopHits.join(", ")}`);
}

function summarise(name, rows, { verbose = false, breakdown = false } = {}) {
  const summary = aggregate(rows);
  console.log(name);
  console.log(`  queries          ${summary.total}`);
  console.log(`  passing          ${summary.passed}/${summary.total}  (${(summary.passRate * 100).toFixed(1)}%)`);
  console.log(`  mean precision@k ${summary.meanPrecisionAtK.toFixed(3)}   (k = min(${MAX_K}, relevant))`);
  console.log(`  mean recall      ${summary.meanRecall.toFixed(3)}`);
  console.log(`  failed case IDs  ${summary.failedCaseIds.join(", ") || "(none)"}`);
  if (breakdown) {
    console.log("  category breakdown");
    for (const [category, result] of Object.entries(grouped(rows, "category"))) {
      console.log(`    ${category.padEnd(24)} ${result.passed}/${result.total} (${(result.passRate * 100).toFixed(1)}%)`);
    }
  }
  console.log("");
  for (const row of rows) {
    if (!verbose && row.passed) continue;
    printRow(row);
  }
  if (verbose || summary.failed > 0) console.log("");
  return summary;
}

function parseArgs(args) {
  return {
    which: args.find((arg) => arg.startsWith("--set="))?.split("=")[1] ?? "development",
    verbose: args.includes("--verbose"),
    reportPath: args.find((arg) => arg.startsWith("--report="))?.slice("--report=".length),
  };
}

function finalV2Fingerprints(caseSetSha256) {
  return {
    caseSetSha256,
    catalogSha256: sha256([
      canonicalText(fs.readFileSync(path.join(rootDir, "data", "mock_products.csv"))),
      canonicalText(fs.readFileSync(path.join(rootDir, "data", "product_attributes.csv"))),
    ].join("\u0000")),
    engineSha256: fileHash("lib/semantic-search.ts"),
    evaluationHarnessSha256: fileHash("scripts/semantic-eval.mjs"),
    structuralValidatorSha256: fileHash("scripts/validate-blind-set.mjs"),
    loaderSha256: fileHash("scripts/load-search.mjs"),
    csvParserSha256: fileHash("scripts/csv.mjs"),
  };
}

function loadAndValidateFinalV2Manifest(fingerprints, structuralErrors) {
  const errors = [...structuralErrors];
  if (!fs.existsSync(FINAL_V2_MANIFEST_PATH)) {
    errors.push("sealed v2 manifest is missing");
    return { manifest: null, errors };
  }

  const manifest = JSON.parse(fs.readFileSync(FINAL_V2_MANIFEST_PATH, "utf8"));
  if (![
    "sealed-awaiting-first-run",
    "evaluated-once-immutable",
  ].includes(manifest.status)) errors.push(`invalid v2 manifest status: ${manifest.status}`);
  if (manifest.caseCount !== FINAL_BLIND_V2_SET.length) errors.push("v2 manifest caseCount does not match the set");
  for (const [field, actual] of Object.entries(fingerprints)) {
    if (manifest[field] !== actual) errors.push(`${field} differs from the sealed v2 manifest`);
  }
  return { manifest, errors };
}

function writeOrVerifyFinalV2Report(rows, fingerprints, manifest) {
  const absolutePath = FINAL_V2_REPORT_PATH;
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const report = {
    schemaVersion: 1,
    evaluation: "WEFT frozen final blind v2 search evaluation",
    sealedOn: manifest.sealedOn,
    caseSetSha256: fingerprints.caseSetSha256,
    catalogSha256: fingerprints.catalogSha256,
    engineSha256: fingerprints.engineSha256,
    thresholds: {
      queryPassPrecisionAtK: PRECISION_TARGET,
      k: `min(${MAX_K}, relevant count)`,
      finalSetIsGated: false,
      alternativesCountAsMatches: false,
    },
    summary: aggregate(rows),
    byCategory: grouped(rows, "category"),
    byDifficulty: grouped(rows, "difficulty"),
    cases: rows,
  };
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  const generatedHash = sha256(canonicalText(serialized));

  if (manifest.firstRun) {
    const expectedSummary = {
      total: manifest.firstRun.total,
      passed: manifest.firstRun.passed,
      passRate: manifest.firstRun.passRate,
      meanPrecisionAtK: manifest.firstRun.meanPrecisionAtK,
      meanRecall: manifest.firstRun.meanRecall,
    };
    const actualSummary = {
      total: report.summary.total,
      passed: report.summary.passed,
      passRate: report.summary.passRate,
      meanPrecisionAtK: report.summary.meanPrecisionAtK,
      meanRecall: report.summary.meanRecall,
    };
    if (JSON.stringify(expectedSummary) !== JSON.stringify(actualSummary)) {
      throw new Error("generated v2 summary differs from the immutable first-run manifest");
    }
    if (generatedHash !== manifest.firstRun.reportSha256) {
      throw new Error(`generated v2 report hash ${generatedHash} differs from the immutable first run`);
    }
    if (!fs.existsSync(absolutePath)) throw new Error("immutable v2 first-run report is missing");
    const existingHash = sha256(canonicalText(fs.readFileSync(absolutePath)));
    if (existingHash !== generatedHash) throw new Error("stored v2 report differs from the immutable first run");
    console.log(`report             ${path.relative(rootDir, absolutePath)} (immutable first run verified)`);
    return;
  }

  if (manifest.status !== "sealed-awaiting-first-run") {
    throw new Error("v2 manifest has no firstRun record but is not awaiting its first run");
  }
  if (fs.existsSync(absolutePath)) {
    throw new Error("refusing first run: an unrecorded v2 report already exists");
  }

  fs.writeFileSync(absolutePath, serialized, "utf8");
  const firstRun = {
    evaluatedOn: manifest.sealedOn,
    passed: report.summary.passed,
    total: report.summary.total,
    passRate: report.summary.passRate,
    meanPrecisionAtK: report.summary.meanPrecisionAtK,
    meanRecall: report.summary.meanRecall,
    reportSha256: generatedHash,
  };
  const recordedManifest = {
    ...manifest,
    status: "evaluated-once-immutable",
    firstRun,
  };
  fs.writeFileSync(FINAL_V2_MANIFEST_PATH, `${JSON.stringify(recordedManifest, null, 2)}\n`, "utf8");
  console.log(`report             ${path.relative(rootDir, absolutePath)} (first run recorded and frozen)`);
  console.log(`report sha256      ${generatedHash}`);
}

async function evaluate({ verbose, which }) {
  const engine = loadSemanticSearch();
  const products = loadProducts();
  const gating = [];

  if (which === "final-blind-v2") {
    const structural = await validateBlindSet({
      setPath: "scripts/final-blind-v2-queries.mjs",
      exportName: "FINAL_BLIND_V2_SET",
      prefix: "FB2",
    });
    const fingerprints = finalV2Fingerprints(structural.caseSetSha256);
    const { manifest, errors } = loadAndValidateFinalV2Manifest(fingerprints, structural.errors);
    if (errors.length > 0 || !manifest) {
      for (const error of errors) console.error(`ERROR: ${error}`);
      console.error("RESULT: final blind v2 seal validation failed; evaluation was not run");
      return false;
    }

    console.log(`sealed case hash   ${fingerprints.caseSetSha256}`);
    console.log(`sealed engine hash ${fingerprints.engineSha256}`);
    const rows = scoreSet("final-blind-v2", FINAL_BLIND_V2_SET, engine, products);
    summarise("FINAL BLIND V2 — frozen report-only evaluation", rows, { verbose, breakdown: true });
    writeOrVerifyFinalV2Report(rows, fingerprints, manifest);
    console.log("RESULT: final blind v2 recorded; do not tune against these failures");
    return true;
  }

  if (["development", "all", "dev"].includes(which)) {
    const rows = scoreSet("dev", DEV_SET, engine, products);
    gating.push(summarise("DEV set — tuning allowed; fit ceiling", rows, { verbose }));
  }
  if (["development", "all", "dev"].includes(which)) {
    const rows = scoreSet("regression", REGRESSION_SET, engine, products);
    gating.push(summarise("REGRESSION core — inspected tripwire (48 cases)", rows, { verbose }));
  }
  if (["all", "regression"].includes(which)) {
    const rows = scoreSet(
      "consumed-regression",
      [...REGRESSION_SET, ...CONSUMED_FINAL_BLIND_SET_2026_09_07],
      engine,
      products,
    );
    summarise("CONSUMED regression — inspected diagnostics (48 legacy + 200 former-final cases)", rows, { verbose });
  }
  if (["all", "historical-blind"].includes(which)) {
    const rows = scoreSet("historical-blind-2026-08-27", HISTORICAL_BLIND_SET_2026_08_27, engine, products);
    summarise("HISTORICAL BLIND 2026-08-27 — already inspected; not a final metric", rows, { verbose });
  }
  const knownSets = new Set(["development", "all", "dev", "regression", "historical-blind"]);
  if (!knownSets.has(which)) {
    console.error(`Unknown set: ${which}`);
    return false;
  }

  console.log(`gate target        DEV >= ${(DEV_PASS_RATE_TARGET * 100).toFixed(0)}%, core REGRESSION >= ${(REGRESSION_PASS_RATE_TARGET * 100).toFixed(0)}%; precision@k >= ${PRECISION_TARGET} per query`);
  const overallPass = gating.every((result, index) => result.passRate >= (index === 0 ? DEV_PASS_RATE_TARGET : REGRESSION_PASS_RATE_TARGET));
  console.log(overallPass ? "RESULT: threshold met" : "RESULT: below threshold");
  return overallPass;
}

process.exit(await evaluate(parseArgs(process.argv.slice(2))) ? 0 : 1);
