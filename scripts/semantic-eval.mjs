/**
 * Semantic-search evaluation harness.
 *
 * Runs a labelled query set through `lib/semantic-search.ts` and reports
 * precision@5, recall, and a pass/fail per query against an agreed threshold.
 * This is what makes "semantic search works" a measurement instead of an
 * opinion — the ROADMAP gate for Phase 2 is a number this script prints.
 *
 *   node scripts/semantic-eval.mjs           # summary
 *   node scripts/semantic-eval.mjs --verbose # per-query detail
 *
 * The expected sets below were labelled by hand against the 64-row synthetic
 * catalog. They are relevance judgements, not assertions about the code: if a
 * query's expected set looks wrong, argue with the label, then change it.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { DEV_SET, HELDOUT_SET } from "./search-queries.mjs";

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// The engine is TypeScript with a path alias; strip both so plain node can run
// it without pulling in a bundler for a test script.
function loadSemanticSearch() {
  const source = fs.readFileSync(path.join(rootDir, "lib", "semantic-search.ts"), "utf8");
  const transpiled = require("typescript").transpileModule(source, {
    compilerOptions: { module: "CommonJS", target: "ES2022" },
  }).outputText;
  const moduleScope = { exports: {} };
  new Function("exports", "module", "require", transpiled)(moduleScope.exports, moduleScope, require);
  return moduleScope.exports;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && inQuotes && line[index + 1] === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

function readCsv(fileName) {
  const filePath = path.join(rootDir, "data", fileName);
  if (!fs.existsSync(filePath)) return [];
  const [headerLine, ...rows] = fs.readFileSync(filePath, "utf8").trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  return rows.map((row) => {
    const values = parseCsvLine(row);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

/**
 * Joins the visual attributes onto the catalog exactly as `getMockProducts`
 * does. Scoring the bare CSV here would test a product the site does not serve
 * — every motif query would silently fail.
 */
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

/**
 * Precision is measured at k = min(5, |relevant|), not a flat @5.
 *
 * A flat @5 is unmeasurable for a narrow query: "black boots" has exactly one
 * right answer in a 64-item catalog, so even a perfect ranking scores 0.2 and
 * the query can never pass. Cutting at the size of the relevant set asks the
 * question that actually matters — are the right items at the top — and keeps
 * the number comparable across broad and narrow queries.
 */
const PRECISION_TARGET = 0.6;
const PASS_RATE_TARGET = 0.8;
const MAX_K = 5;

function scoreSet(name, queries, { semanticSearch, interpretQuery }, products) {
  const rows = [];

  for (const testCase of queries) {
    // Mirror `searchProducts` in lib/mock-products.ts: a price ceiling parsed
    // out of the query is a hard filter applied before ranking, not a ranking
    // signal. Scoring the raw catalog here would test a path the app never runs.
    const { maxPrice } = interpretQuery(testCase.query);
    const candidates = maxPrice
      ? products.filter((product) => Number(product.price_eur) <= maxPrice)
      : products;
    const ranked = semanticSearch(candidates, testCase.query).matches.map(
      (match) => match.product.mock_product_id,
    );

    const relevant = new Set(testCase.relevant);
    const overCap = testCase.maxResults !== undefined && ranked.length > testCase.maxResults;

    // A query with no relevant products is asserting the catalog does not
    // stock the thing. Precision is then simply "did we resist inventing an
    // answer" — the cap carries the whole judgement.
    const isNegative = relevant.size === 0;
    const k = isNegative ? 0 : Math.min(MAX_K, relevant.size);
    const topK = ranked.slice(0, k);
    const precision = isNegative ? (overCap ? 0 : 1) : topK.filter((id) => relevant.has(id)).length / k;
    const recall = isNegative ? 1 : ranked.filter((id) => relevant.has(id)).length / relevant.size;

    const required = testCase.mustRank ?? [];
    const missingRequired = required.filter(
      (id) => !ranked.slice(0, Math.max(k, required.length)).includes(id),
    );

    const passed = precision >= PRECISION_TARGET && missingRequired.length === 0 && !overCap;
    rows.push({ ...testCase, name, ranked, k, precision, recall, missingRequired, overCap, passed, returned: ranked.length });
  }

  return rows;
}

function summarise(name, rows, { verbose }) {
  const passCount = rows.filter((row) => row.passed).length;
  const passRate = rows.length === 0 ? 1 : passCount / rows.length;
  const meanPrecision = rows.reduce((sum, row) => sum + row.precision, 0) / rows.length;
  const meanRecall = rows.reduce((sum, row) => sum + row.recall, 0) / rows.length;

  console.log(`${name}`);
  console.log(`  queries          ${rows.length}`);
  console.log(`  passing          ${passCount}/${rows.length}  (${(passRate * 100).toFixed(1)}%)`);
  console.log(`  mean precision@k ${meanPrecision.toFixed(3)}   (k = min(${MAX_K}, relevant))`);
  console.log(`  mean recall      ${meanRecall.toFixed(3)}`);
  console.log("");

  for (const row of rows) {
    if (!verbose && row.passed) continue;
    console.log(`${row.passed ? "PASS" : "FAIL"}  ${row.query}   [${row.intent}]`);
    console.log(`      precision@${row.k} ${row.precision.toFixed(2)}  recall ${row.recall.toFixed(2)}  returned ${row.returned}`);
    console.log(`      top${MAX_K}: ${row.ranked.slice(0, MAX_K).join(", ") || "(none)"}`);
    if (row.missingRequired.length > 0) {
      console.log(`      missing required: ${row.missingRequired.join(", ")}`);
    }
    if (row.overCap) {
      console.log(`      too many results: ${row.returned} returned, cap is ${row.maxResults}`);
    }
  }
  if (rows.some((row) => !row.passed)) console.log("");

  return { passRate, meanPrecision, meanRecall };
}

function evaluate({ verbose, which }) {
  const engine = loadSemanticSearch();
  const products = loadProducts();

  const results = [];
  if (which !== "holdout") {
    results.push(summarise("DEV set (tuning is allowed against this)", scoreSet("dev", DEV_SET, engine, products), { verbose }));
  }
  if (which !== "dev") {
    results.push(summarise("HELD-OUT set (sealed; scored once)", scoreSet("holdout", HELDOUT_SET, engine, products), { verbose }));
  }

  console.log(`target             pass rate >= ${(PASS_RATE_TARGET * 100).toFixed(0)}%, precision@k >= ${PRECISION_TARGET} per query`);
  const overallPass = results.every((result) => result.passRate >= PASS_RATE_TARGET);
  console.log(overallPass ? "RESULT: threshold met" : "RESULT: below threshold");
  return overallPass;
}

const args = process.argv.slice(2);
const which = args.find((arg) => arg.startsWith("--set="))?.split("=")[1] ?? "all";
process.exit(evaluate({ verbose: args.includes("--verbose"), which }) ? 0 : 1);
