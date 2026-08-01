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

function loadProducts() {
  const csv = fs.readFileSync(path.join(rootDir, "data", "mock_products.csv"), "utf8").trim();
  const [headerLine, ...rows] = csv.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  return rows
    .map((row) => {
      const values = parseCsvLine(row);
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    })
    .filter((product) => product.source_status === "mock_not_live");
}

/**
 * Labelled query set: 24 queries across the intent classes the catalog can
 * actually answer — season, weather, occasion, activity, material, colour
 * family, price, department, exact-name recall, and Lithuanian equivalents.
 *
 * `relevant` is the full set a shopper would accept. `mustRank` (optional) are
 * the items that have to appear in the top 5 for the query to count as passing
 * — for broad queries, ordering is the whole product.
 *
 * `maxResults` (optional) caps how much may come back at all. This exists
 * because precision@k only inspects the top of the list and is blind to a
 * bloated tail: "what should i wear to the office" once returned 38 of 64
 * products — sweatpants and graphic tees included — while scoring a clean
 * 25/25 here. The caps are judgements about what a shopper should be shown,
 * set independently of what the code currently returns.
 */
const QUERY_SET = [
  {
    query: "something warm for winter",
    intent: "season",
    relevant: ["MOCK-013", "MOCK-044", "MOCK-054", "MOCK-048", "MOCK-006", "MOCK-019", "MOCK-056", "MOCK-011", "MOCK-032", "MOCK-007"],
  },
  {
    query: "šilta striukė žiemai",
    intent: "season / lt",
    relevant: ["MOCK-013", "MOCK-044", "MOCK-054", "MOCK-011", "MOCK-019", "MOCK-003", "MOCK-034", "MOCK-042", "MOCK-007", "MOCK-052"],
  },
  {
    query: "what should i wear to the office",
    maxResults: 20,
    intent: "occasion",
    relevant: ["MOCK-007", "MOCK-052", "MOCK-002", "MOCK-049", "MOCK-063", "MOCK-001", "MOCK-055", "MOCK-013", "MOCK-044", "MOCK-009"],
  },
  {
    query: "outfit for a night out",
    maxResults: 12,
    intent: "occasion",
    relevant: ["MOCK-045", "MOCK-053", "MOCK-023", "MOCK-010", "MOCK-051", "MOCK-043", "MOCK-025"],
  },
  {
    query: "dress for a summer date",
    maxResults: 6,
    intent: "occasion",
    relevant: ["MOCK-023", "MOCK-045", "MOCK-061", "MOCK-053"],
  },
  {
    query: "clothes for the gym",
    intent: "activity",
    relevant: ["MOCK-021", "MOCK-038", "MOCK-026", "MOCK-035", "MOCK-034", "MOCK-004"],
  },
  {
    // The subject is "shoes". An earlier draft of this label also listed the
    // technical parka, which was a labelling error: it answers "rain" but it is
    // not what was asked for.
    query: "shoes for hiking in the rain",
    maxResults: 6,
    intent: "weather / activity",
    relevant: ["MOCK-041", "MOCK-050", "MOCK-043"],
    mustRank: ["MOCK-041"],
  },
  {
    // Trail sneakers were on this label in an earlier draft. They are
    // waterproof, but they are not a jacket, so the garment rule now excludes
    // them and it is right to — the label was the thing that was wrong.
    query: "waterproof jacket",
    maxResults: 8,
    intent: "material",
    relevant: ["MOCK-054", "MOCK-034", "MOCK-042"],
  },
  {
    // "knit" names the subject, and the catalog holds exactly two knitted
    // pieces. An earlier draft of this label also listed hoodies and
    // sweatpants, which is what "cosy" alone would justify — not "knit".
    query: "cosy knit for the sofa",
    maxResults: 4,
    intent: "mood + garment",
    relevant: ["MOCK-006", "MOCK-048"],
    mustRank: ["MOCK-006", "MOCK-048"],
  },
  {
    // The same mood with no garment named, which should stay open.
    query: "something cosy to wear at home",
    intent: "mood",
    relevant: ["MOCK-006", "MOCK-048", "MOCK-008", "MOCK-057", "MOCK-032", "MOCK-026", "MOCK-056", "MOCK-015"],
  },
  {
    query: "streetwear hoodie",
    maxResults: 6,
    intent: "style + garment",
    relevant: ["MOCK-057", "MOCK-008", "MOCK-032", "MOCK-015"],
    mustRank: ["MOCK-057", "MOCK-008", "MOCK-032"],
  },
  {
    query: "black boots",
    maxResults: 4,
    intent: "colour + garment",
    relevant: ["MOCK-043"],
    mustRank: ["MOCK-043"],
  },
  {
    query: "white sneakers",
    maxResults: 8,
    intent: "colour + garment",
    relevant: ["MOCK-029", "MOCK-046", "MOCK-062", "MOCK-037"],
    mustRank: ["MOCK-029", "MOCK-046", "MOCK-062"],
  },
  {
    query: "bag for travelling",
    intent: "occasion + garment",
    relevant: ["MOCK-060", "MOCK-024", "MOCK-027", "MOCK-064", "MOCK-047", "MOCK-016", "MOCK-040"],
  },
  {
    query: "bag for my laptop",
    maxResults: 6,
    intent: "use case",
    relevant: ["MOCK-024", "MOCK-047", "MOCK-060"],
  },
  {
    query: "jeans under 40",
    maxResults: 4,
    intent: "price ceiling",
    relevant: ["MOCK-017"],
    mustRank: ["MOCK-017"],
  },
  {
    // "kelnės" covers all legwear, jeans included — an earlier draft of this
    // label excluded them, which no Lithuanian shopper would.
    query: "kelnės iki 45",
    intent: "price ceiling / lt",
    relevant: ["MOCK-002", "MOCK-005", "MOCK-017", "MOCK-021", "MOCK-026", "MOCK-035", "MOCK-058"],
  },
  {
    query: "cheap accessories",
    intent: "price direction",
    relevant: ["MOCK-020", "MOCK-031", "MOCK-036", "MOCK-009", "MOCK-055", "MOCK-051", "MOCK-040", "MOCK-056"],
  },
  {
    query: "what is on sale",
    intent: "commercial",
    relevant: ["MOCK-002", "MOCK-005", "MOCK-007", "MOCK-010", "MOCK-013", "MOCK-015", "MOCK-017", "MOCK-019", "MOCK-023", "MOCK-026", "MOCK-029", "MOCK-032", "MOCK-034", "MOCK-037", "MOCK-040", "MOCK-042", "MOCK-043", "MOCK-044", "MOCK-047", "MOCK-049", "MOCK-052", "MOCK-054", "MOCK-056", "MOCK-057", "MOCK-060", "MOCK-061", "MOCK-063"],
  },
  {
    query: "minimal neutral basics",
    intent: "aesthetic",
    relevant: ["MOCK-012", "MOCK-001", "MOCK-004", "MOCK-046", "MOCK-024", "MOCK-018", "MOCK-006", "MOCK-048"],
  },
  {
    query: "graphic tee",
    maxResults: 6,
    intent: "print + garment",
    relevant: ["MOCK-022", "MOCK-039"],
    mustRank: ["MOCK-022", "MOCK-039"],
  },
  {
    query: "moteriškas sijonas",
    maxResults: 6,
    intent: "department + garment / lt",
    relevant: ["MOCK-010", "MOCK-014", "MOCK-025", "MOCK-028"],
    mustRank: ["MOCK-010", "MOCK-014", "MOCK-025", "MOCK-028"],
  },
  {
    query: "sportbačiai",
    intent: "garment / lt",
    relevant: ["MOCK-029", "MOCK-030", "MOCK-033", "MOCK-037", "MOCK-041", "MOCK-046", "MOCK-062"],
  },
  {
    query: "Emerald Satin Midi Dress",
    maxResults: 6,
    intent: "exact title recall",
    relevant: ["MOCK-045"],
    mustRank: ["MOCK-045"],
  },
  {
    query: "snekaers",
    maxResults: 10,
    intent: "typo tolerance",
    relevant: ["MOCK-029", "MOCK-030", "MOCK-033", "MOCK-037", "MOCK-041", "MOCK-046", "MOCK-062"],
  },
];

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

function evaluate({ verbose }) {
  const { semanticSearch, interpretQuery } = loadSemanticSearch();
  const products = loadProducts();
  const rows = [];

  for (const testCase of QUERY_SET) {
    // Mirror `searchProducts` in lib/mock-products.ts: a price ceiling parsed
    // out of the query is a hard filter applied before ranking, not a ranking
    // signal. Scoring the raw catalog here would test a path the app never runs.
    const { maxPrice } = interpretQuery(testCase.query);
    const candidates = maxPrice
      ? products.filter((product) => Number(product.price_eur) <= maxPrice)
      : products;
    const { matches } = semanticSearch(candidates, testCase.query);
    const ranked = matches.map((match) => match.product.mock_product_id);
    const relevant = new Set(testCase.relevant);
    const k = Math.min(MAX_K, relevant.size);
    const topK = ranked.slice(0, k);

    const hits = topK.filter((id) => relevant.has(id)).length;
    const precision = k === 0 ? 0 : hits / k;
    const recall = relevant.size === 0 ? 1 : ranked.filter((id) => relevant.has(id)).length / relevant.size;
    const missingRequired = (testCase.mustRank ?? []).filter(
      (id) => !ranked.slice(0, Math.max(k, testCase.mustRank.length)).includes(id),
    );
    const overCap = testCase.maxResults !== undefined && ranked.length > testCase.maxResults;
    const passed = precision >= PRECISION_TARGET && missingRequired.length === 0 && !overCap;

    rows.push({ ...testCase, ranked, k, precision, recall, missingRequired, overCap, passed, returned: ranked.length });
  }

  const passCount = rows.filter((row) => row.passed).length;
  const passRate = passCount / rows.length;
  const meanPrecision = rows.reduce((sum, row) => sum + row.precision, 0) / rows.length;
  const meanRecall = rows.reduce((sum, row) => sum + row.recall, 0) / rows.length;

  console.log("Semantic search evaluation");
  console.log(`  queries          ${rows.length}`);
  console.log(`  passing          ${passCount}/${rows.length}  (${(passRate * 100).toFixed(1)}%)`);
  console.log(`  mean precision@k ${meanPrecision.toFixed(3)}   (k = min(5, relevant))`);
  console.log(`  mean recall      ${meanRecall.toFixed(3)}`);
  console.log(`  target           pass rate >= ${(PASS_RATE_TARGET * 100).toFixed(0)}%, precision@k >= ${PRECISION_TARGET} per query`);
  console.log("");

  for (const row of rows) {
    if (!verbose && row.passed) continue;
    const mark = row.passed ? "PASS" : "FAIL";
    console.log(`${mark}  ${row.query}   [${row.intent}]`);
    console.log(`      precision@${row.k} ${row.precision.toFixed(2)}  recall ${row.recall.toFixed(2)}  returned ${row.returned}`);
    console.log(`      top${MAX_K}: ${row.ranked.slice(0, MAX_K).join(", ") || "(none)"}`);
    if (row.missingRequired.length > 0) {
      console.log(`      missing required: ${row.missingRequired.join(", ")}`);
    }
    if (row.overCap) {
      console.log(`      too many results: ${row.returned} returned, cap is ${row.maxResults}`);
    }
  }

  const overallPass = passRate >= PASS_RATE_TARGET;
  console.log("");
  console.log(overallPass ? "RESULT: threshold met" : "RESULT: below threshold");
  return overallPass;
}

process.exit(evaluate({ verbose: process.argv.includes("--verbose") }) ? 0 : 1);
