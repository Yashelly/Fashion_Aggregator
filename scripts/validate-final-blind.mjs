import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEV_SET,
  HISTORICAL_BLIND_SET_2026_08_27,
  REGRESSION_SET,
} from "./search-queries.mjs";
import { CONSUMED_FINAL_BLIND_SET_2026_09_07 } from "./final-blind-queries.mjs";

const FINAL_BLIND_SET = CONSUMED_FINAL_BLIND_SET_2026_09_07;
import { parseCsvRecords } from "./csv.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(rootDir, "scripts", "final-blind-manifest.json");
const EXPECTED_CASES = 200;
const EXPECTED_CATEGORIES = [
  "ambiguous_conceptual",
  "color_constraints",
  "construction_details",
  "garment_identity",
  "lithuanian_language",
  "materials_textures",
  "negatives_exclusions",
  "occasion_style",
  "price_value",
  "weather_activity",
];

const STOPWORDS = new Set([
  "a", "an", "and", "for", "i", "in", "is", "me", "my", "of", "on", "please",
  "some", "something", "the", "to", "want", "wear", "with",
  "ar", "ir", "is", "man", "mano", "noriu", "su",
]);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function canonicalText(value) {
  return value.toString("utf8").replace(/\r\n?/g, "\n");
}

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function significantTokens(value) {
  return normalize(value)
    .split(" ")
    .filter((token) => token && !STOPWORDS.has(token));
}

function levenshtein(first, second) {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index);
  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    const current = [firstIndex];
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      current[secondIndex] = Math.min(
        current[secondIndex - 1] + 1,
        previous[secondIndex] + 1,
        previous[secondIndex - 1] + (first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[second.length];
}

function nearDuplicateReason(first, second) {
  const left = normalize(first);
  const right = normalize(second);
  if (left === right) return "same normalized text";

  const maxLength = Math.max(left.length, right.length);
  if (maxLength >= 12 && 1 - levenshtein(left, right) / maxLength >= 0.88) {
    return "character similarity >= 0.88";
  }

  const leftTokens = new Set(significantTokens(first));
  const rightTokens = new Set(significantTokens(second));
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  const smaller = Math.min(leftTokens.size, rightTokens.size);
  if (intersection >= 2 && union > 0 && intersection / union >= 0.8) {
    return "significant-token Jaccard >= 0.80";
  }
  if (smaller >= 3 && intersection === smaller && Math.abs(leftTokens.size - rightTokens.size) <= 1) {
    return "one significant-token edit apart";
  }
  return null;
}

function readCatalogIds() {
  const source = fs.readFileSync(path.join(rootDir, "data", "mock_products.csv"), "utf8");
  return new Set(
    parseCsvRecords(source)
      .filter((product) => product.source_status === "mock_not_live")
      .map((product) => product.mock_product_id),
  );
}

function canonicalSetJson() {
  return `${JSON.stringify(FINAL_BLIND_SET, null, 2)}\n`;
}

function fileHash(relativePath) {
  return sha256(canonicalText(fs.readFileSync(path.join(rootDir, relativePath))));
}

export function getFinalBlindFingerprints() {
  return {
    caseSetSha256: sha256(canonicalSetJson()),
    catalogSha256: sha256([
      canonicalText(fs.readFileSync(path.join(rootDir, "data", "mock_products.csv"))),
      canonicalText(fs.readFileSync(path.join(rootDir, "data", "product_attributes.csv"))),
    ].join("\u0000")),
    engineSha256: fileHash("lib/semantic-search.ts"),
    evaluationHarnessSha256: fileHash("scripts/semantic-eval.mjs"),
    loaderSha256: fileHash("scripts/load-search.mjs"),
    csvParserSha256: fileHash("scripts/csv.mjs"),
  };
}

export function validateFinalBlind({ requireManifest = false } = {}) {
  const errors = [];
  const catalogIds = readCatalogIds();

  if (FINAL_BLIND_SET.length !== EXPECTED_CASES) {
    errors.push(`expected ${EXPECTED_CASES} final blind cases, found ${FINAL_BLIND_SET.length}`);
  }

  const seenIds = new Set();
  const seenQueries = new Map();
  const categoryCounts = new Map();
  const difficultyCounts = new Map();
  const validDifficulties = new Set(["easy", "medium", "adversarial"]);
  const validLanguages = new Set(["en", "lt"]);

  for (const [index, testCase] of FINAL_BLIND_SET.entries()) {
    const expectedId = `FB-${String(index + 1).padStart(3, "0")}`;
    if (testCase.id !== expectedId) errors.push(`case ${index + 1}: expected id ${expectedId}, found ${testCase.id}`);
    if (seenIds.has(testCase.id)) errors.push(`${testCase.id}: duplicate case id`);
    seenIds.add(testCase.id);

    if (!EXPECTED_CATEGORIES.includes(testCase.category)) errors.push(`${testCase.id}: unknown category ${testCase.category}`);
    categoryCounts.set(testCase.category, (categoryCounts.get(testCase.category) ?? 0) + 1);
    if (!validDifficulties.has(testCase.difficulty)) errors.push(`${testCase.id}: invalid difficulty ${testCase.difficulty}`);
    difficultyCounts.set(testCase.difficulty, (difficultyCounts.get(testCase.difficulty) ?? 0) + 1);
    if (!validLanguages.has(testCase.language)) errors.push(`${testCase.id}: invalid language ${testCase.language}`);
    if (typeof testCase.query !== "string" || significantTokens(testCase.query).length === 0) errors.push(`${testCase.id}: empty query`);
    if (typeof testCase.intent !== "string" || testCase.intent.length < 3) errors.push(`${testCase.id}: missing intent`);
    if (typeof testCase.expectedOutcome !== "string" || testCase.expectedOutcome.length < 24) errors.push(`${testCase.id}: expectedOutcome must be reviewable prose`);
    if (!Array.isArray(testCase.relevant)) errors.push(`${testCase.id}: relevant must be an array`);

    const normalized = normalize(testCase.query);
    if (seenQueries.has(normalized)) errors.push(`${testCase.id}: duplicate query of ${seenQueries.get(normalized)}`);
    seenQueries.set(normalized, testCase.id);

    const referencedIds = [
      ...(testCase.relevant ?? []),
      ...(testCase.mustRank ?? []),
      ...(testCase.forbiddenTop ?? []),
    ];
    for (const id of referencedIds) {
      if (!catalogIds.has(id)) errors.push(`${testCase.id}: unknown catalog id ${id}`);
    }
    if ((testCase.mustRank ?? []).some((id) => !(testCase.relevant ?? []).includes(id))) {
      errors.push(`${testCase.id}: mustRank must be a subset of relevant`);
    }
    if ((testCase.forbiddenTop ?? []).some((id) => (testCase.relevant ?? []).includes(id))) {
      errors.push(`${testCase.id}: forbiddenTop overlaps relevant`);
    }
    if ((testCase.relevant ?? []).length === 0 && testCase.maxResults !== 0) {
      errors.push(`${testCase.id}: negative cases must set maxResults to 0`);
    }
    if (testCase.forbiddenTop && (!Number.isInteger(testCase.forbiddenTopK) || testCase.forbiddenTopK < 1)) {
      errors.push(`${testCase.id}: forbiddenTop requires a positive forbiddenTopK`);
    }
  }

  for (const category of EXPECTED_CATEGORIES) {
    if ((categoryCounts.get(category) ?? 0) !== 20) {
      errors.push(`category ${category}: expected 20 cases, found ${categoryCounts.get(category) ?? 0}`);
    }
  }

  const priorCases = [
    ...DEV_SET.map((testCase) => ({ ...testCase, source: "DEV_SET" })),
    ...REGRESSION_SET.map((testCase) => ({ ...testCase, source: "REGRESSION_SET" })),
    ...HISTORICAL_BLIND_SET_2026_08_27.map((testCase) => ({ ...testCase, source: "HISTORICAL_BLIND_SET_2026_08_27" })),
  ];
  for (const candidate of FINAL_BLIND_SET) {
    for (const prior of priorCases) {
      const reason = nearDuplicateReason(candidate.query, prior.query);
      if (reason) errors.push(`${candidate.id}: near-duplicate of ${prior.source} "${prior.query}" (${reason})`);
    }
  }
  for (let leftIndex = 0; leftIndex < FINAL_BLIND_SET.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < FINAL_BLIND_SET.length; rightIndex += 1) {
      const reason = nearDuplicateReason(FINAL_BLIND_SET[leftIndex].query, FINAL_BLIND_SET[rightIndex].query);
      if (reason) errors.push(`${FINAL_BLIND_SET[rightIndex].id}: near-duplicate of ${FINAL_BLIND_SET[leftIndex].id} (${reason})`);
    }
  }

  const fingerprints = getFinalBlindFingerprints();
  let manifest = null;
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (manifest.caseCount !== FINAL_BLIND_SET.length) errors.push("manifest caseCount does not match final blind set");
    if (manifest.caseSetSha256 !== fingerprints.caseSetSha256) errors.push("final blind set hash differs from the sealed manifest");
    if (manifest.catalogSha256 !== fingerprints.catalogSha256) errors.push("catalog hash differs from the sealed manifest");
    if (manifest.engineSha256 !== fingerprints.engineSha256) errors.push("search engine hash differs from the sealed manifest");
    if (manifest.evaluationHarnessSha256 !== fingerprints.evaluationHarnessSha256) errors.push("evaluation harness hash differs from the sealed manifest");
    if (manifest.loaderSha256 !== fingerprints.loaderSha256) errors.push("TypeScript loader hash differs from the sealed manifest");
    if (manifest.csvParserSha256 !== fingerprints.csvParserSha256) errors.push("CSV parser hash differs from the sealed manifest");

    const reportPath = path.join(rootDir, "reports", "search", "final-blind-report.json");
    if (manifest.firstRun && fs.existsSync(reportPath)) {
      const reportBytes = fs.readFileSync(reportPath);
      if (manifest.firstRun.reportSha256 !== sha256(canonicalText(reportBytes))) errors.push("first-run report hash differs from the sealed manifest");
      const report = JSON.parse(reportBytes.toString("utf8"));
      for (const field of ["total", "passed", "passRate", "meanPrecisionAtK", "meanRecall"]) {
        if (manifest.firstRun[field] !== report.summary?.[field]) errors.push(`first-run ${field} differs from the report`);
      }
    } else if (manifest.firstRun) {
      errors.push("immutable first-run report is missing");
    }
  } else if (requireManifest) {
    errors.push("sealed manifest is missing");
  }

  return {
    ok: errors.length === 0,
    errors,
    categoryCounts: Object.fromEntries([...categoryCounts].sort()),
    difficultyCounts: Object.fromEntries([...difficultyCounts].sort()),
    fingerprints,
    manifest,
  };
}

function main() {
  const result = validateFinalBlind({ requireManifest: process.argv.includes("--require-manifest") });
  console.log(`final blind cases  ${FINAL_BLIND_SET.length}`);
  console.log(`categories         ${JSON.stringify(result.categoryCounts)}`);
  console.log(`difficulties       ${JSON.stringify(result.difficultyCounts)}`);
  console.log(`case set sha256    ${result.fingerprints.caseSetSha256}`);
  console.log(`catalog sha256     ${result.fingerprints.catalogSha256}`);
  console.log(`engine sha256      ${result.fingerprints.engineSha256}`);
  console.log(`evaluator sha256   ${result.fingerprints.evaluationHarnessSha256}`);
  console.log(`loader sha256      ${result.fingerprints.loaderSha256}`);
  console.log(`csv parser sha256  ${result.fingerprints.csvParserSha256}`);
  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(`ERROR: ${error}`);
  }
  console.log(result.ok ? "STRUCTURE: valid" : "STRUCTURE: invalid");
  process.exitCode = result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
