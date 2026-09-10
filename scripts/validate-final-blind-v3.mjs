/** Structural-only validator for the prospective sealed final blind v3 set. */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsvRecords } from "./csv.mjs";
import { FINAL_BLIND_V3_SET } from "./final-blind-v3-queries.mjs";
import { FINAL_BLIND_V2_SET } from "./final-blind-v2-queries.mjs";
import { CONSUMED_FINAL_BLIND_SET_2026_09_07 } from "./final-blind-queries.mjs";
import { DEV_SET, HISTORICAL_BLIND_SET_2026_08_27, REGRESSION_SET } from "./search-queries.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(rootDir, "scripts", "final-blind-v3-manifest.json");
const reportPath = path.join(rootDir, "reports", "search", "final-blind-v3-report.json");
const CATEGORIES = [
  "ambiguous_conceptual", "color_constraints", "construction_details", "garment_identity",
  "lithuanian_language", "materials_textures", "negatives_exclusions", "occasion_style",
  "price_value", "weather_activity",
];
const STOPWORDS = new Set([
  "a", "an", "and", "any", "for", "from", "i", "in", "is", "it", "me", "my", "of", "on",
  "or", "please", "some", "something", "the", "to", "want", "wear", "with", "without",
  "ar", "be", "ir", "is", "man", "mano", "ne", "noriu", "su",
]);

function canonicalText(value) {
  return value.toString("utf8").replace(/\r\n?/g, "\n");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function fileHash(relativePath) {
  return sha256(canonicalText(fs.readFileSync(path.join(rootDir, relativePath))));
}

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value) {
  return normalize(value).split(" ").filter((token) => token && !STOPWORDS.has(token));
}

function nearDuplicateReason(first, second) {
  const leftText = normalize(first);
  const rightText = normalize(second);
  if (leftText === rightText) return "same normalized query";
  const left = new Set(tokens(first));
  const right = new Set(tokens(second));
  const overlap = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  const smaller = Math.min(left.size, right.size);
  if (overlap >= 3 && union > 0 && overlap / union >= 0.72) return "significant-token Jaccard >= 0.72";
  if (smaller >= 4 && overlap === smaller && Math.abs(left.size - right.size) <= 1) return "one significant-token edit apart";
  return null;
}

function catalogIds() {
  return new Set(parseCsvRecords(fs.readFileSync(path.join(rootDir, "data", "mock_products.csv"), "utf8"))
    .filter((row) => row.source_status === "mock_not_live")
    .map((row) => row.mock_product_id));
}

export function finalBlindV3Fingerprints() {
  return {
    caseSetSha256: sha256(`${JSON.stringify(FINAL_BLIND_V3_SET, null, 2)}\n`),
    catalogSha256: sha256([
      canonicalText(fs.readFileSync(path.join(rootDir, "data", "mock_products.csv"))),
      canonicalText(fs.readFileSync(path.join(rootDir, "data", "product_attributes.csv"))),
    ].join("\u0000")),
    productionHybridSha256: fileHash("lib/hybrid-search.ts"),
    productionEmbeddingSha256: fileHash("lib/search-embedding.ts"),
    productionJudgeSha256: fileHash("lib/search-judge.ts"),
    conceptEngineSha256: fileHash("lib/semantic-search.ts"),
    evaluationHarnessSha256: fileHash("scripts/final-blind-v3-eval.mjs"),
    providerHarnessSha256: fileHash("scripts/cloud-search-providers.mjs"),
    catalogLoaderSha256: fileHash("scripts/search-catalog.mjs"),
  };
}

export function validateFinalBlindV3({ requireManifest = false } = {}) {
  const errors = [];
  const ids = catalogIds();
  const categoryCounts = new Map();
  const difficultyCounts = new Map();
  const seenIds = new Set();
  const seenQueries = new Map();

  if (FINAL_BLIND_V3_SET.length !== 200) errors.push(`expected 200 cases, found ${FINAL_BLIND_V3_SET.length}`);
  for (const [index, item] of FINAL_BLIND_V3_SET.entries()) {
    const expectedId = `FB3-${String(index + 1).padStart(3, "0")}`;
    if (item.id !== expectedId) errors.push(`case ${index + 1}: expected ${expectedId}, found ${item.id}`);
    if (seenIds.has(item.id)) errors.push(`${item.id}: duplicate ID`);
    seenIds.add(item.id);
    if (!CATEGORIES.includes(item.category)) errors.push(`${item.id}: invalid category ${item.category}`);
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
    if (!["easy", "medium", "adversarial"].includes(item.difficulty)) errors.push(`${item.id}: invalid difficulty`);
    difficultyCounts.set(item.difficulty, (difficultyCounts.get(item.difficulty) ?? 0) + 1);
    if (!["en", "lt"].includes(item.language)) errors.push(`${item.id}: invalid language`);
    if (typeof item.query !== "string" || tokens(item.query).length < 2) errors.push(`${item.id}: query lacks meaningful wording`);
    if (typeof item.intent !== "string" || item.intent.length < 6) errors.push(`${item.id}: missing intent`);
    if (typeof item.expectedOutcome !== "string" || item.expectedOutcome.length < 40) errors.push(`${item.id}: expected outcome is not reviewable`);
    if (!Array.isArray(item.relevant)) errors.push(`${item.id}: relevant must be an array`);
    if (!Number.isInteger(item.maxResults) || item.maxResults < 0 || item.maxResults > 12) errors.push(`${item.id}: invalid maxResults`);
    if (item.relevant.length === 0 && item.maxResults !== 0) errors.push(`${item.id}: negative case must have maxResults 0`);
    if (item.relevant.length > 0 && item.maxResults === 0) errors.push(`${item.id}: positive case cannot have maxResults 0`);
    if (item.exactResults !== undefined && (!Number.isInteger(item.exactResults) || item.exactResults < 0 || item.exactResults > item.maxResults)) errors.push(`${item.id}: invalid exactResults`);
    if (item.mustRank && (!Number.isInteger(item.mustRankTopK) || item.mustRankTopK < 1 || item.mustRankTopK > 5)) errors.push(`${item.id}: invalid mustRankTopK`);
    if (item.forbiddenTop && (!Number.isInteger(item.forbiddenTopK) || item.forbiddenTopK < 1 || item.forbiddenTopK > 5)) errors.push(`${item.id}: invalid forbiddenTopK`);

    const referenced = [...(item.relevant ?? []), ...(item.mustRank ?? []), ...(item.forbiddenTop ?? [])];
    for (const productId of referenced) if (!ids.has(productId)) errors.push(`${item.id}: unknown catalog ID ${productId}`);
    if ((item.mustRank ?? []).some((id) => !item.relevant.includes(id))) errors.push(`${item.id}: mustRank must be relevant`);
    if ((item.forbiddenTop ?? []).some((id) => item.relevant.includes(id))) errors.push(`${item.id}: forbiddenTop overlaps relevant`);

    const normalized = normalize(item.query);
    if (seenQueries.has(normalized)) errors.push(`${item.id}: duplicate of ${seenQueries.get(normalized)}`);
    seenQueries.set(normalized, item.id);
  }

  for (const category of CATEGORIES) if ((categoryCounts.get(category) ?? 0) !== 20) errors.push(`${category}: expected 20 cases`);
  for (const [difficulty, expected] of [["easy", 60], ["medium", 80], ["adversarial", 60]]) {
    if ((difficultyCounts.get(difficulty) ?? 0) !== expected) errors.push(`${difficulty}: expected ${expected}, found ${difficultyCounts.get(difficulty) ?? 0}`);
  }

  const prior = [
    ...DEV_SET.map((item) => ({ ...item, source: "DEV" })),
    ...REGRESSION_SET.map((item) => ({ ...item, source: "REGRESSION" })),
    ...HISTORICAL_BLIND_SET_2026_08_27.map((item) => ({ ...item, source: "HISTORICAL_18" })),
    ...CONSUMED_FINAL_BLIND_SET_2026_09_07.map((item) => ({ ...item, source: "CONSUMED_V1" })),
    ...FINAL_BLIND_V2_SET.map((item) => ({ ...item, source: "CONSUMED_V2" })),
  ];
  for (const candidate of FINAL_BLIND_V3_SET) for (const older of prior) {
    const reason = nearDuplicateReason(candidate.query, older.query);
    if (reason) errors.push(`${candidate.id}: near-duplicate of ${older.source} "${older.query}" (${reason})`);
  }
  for (let left = 0; left < FINAL_BLIND_V3_SET.length; left += 1) {
    for (let right = left + 1; right < FINAL_BLIND_V3_SET.length; right += 1) {
      const reason = nearDuplicateReason(FINAL_BLIND_V3_SET[left].query, FINAL_BLIND_V3_SET[right].query);
      if (reason) errors.push(`${FINAL_BLIND_V3_SET[right].id}: near-duplicate of ${FINAL_BLIND_V3_SET[left].id} (${reason})`);
    }
  }

  const fingerprints = finalBlindV3Fingerprints();
  let manifest = null;
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (!["sealed-awaiting-first-run", "evaluated-once-immutable"].includes(manifest.status)) errors.push(`invalid manifest status ${manifest.status}`);
    if (manifest.caseCount !== FINAL_BLIND_V3_SET.length) errors.push("manifest case count mismatch");
    for (const [field, actual] of Object.entries(fingerprints)) if (manifest[field] !== actual) errors.push(`${field} differs from sealed manifest`);
    if (manifest.firstRun) {
      if (!fs.existsSync(reportPath)) errors.push("immutable first-run report is missing");
      else if (manifest.firstRun.reportSha256 !== sha256(canonicalText(fs.readFileSync(reportPath)))) errors.push("first-run report hash mismatch");
    }
  } else if (requireManifest) {
    errors.push("sealed v3 manifest is missing");
  }

  return {
    ok: errors.length === 0,
    errors,
    fingerprints,
    manifest,
    categoryCounts: Object.fromEntries([...categoryCounts].sort()),
    difficultyCounts: Object.fromEntries([...difficultyCounts].sort()),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateFinalBlindV3({ requireManifest: process.argv.includes("--require-manifest") });
  console.log(`cases              ${FINAL_BLIND_V3_SET.length}`);
  console.log(`categories         ${JSON.stringify(result.categoryCounts)}`);
  console.log(`difficulties       ${JSON.stringify(result.difficultyCounts)}`);
  for (const [name, hash] of Object.entries(result.fingerprints)) console.log(`${name.padEnd(26)} ${hash}`);
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  console.log(result.ok ? "STRUCTURE: valid" : "STRUCTURE: invalid");
  process.exitCode = result.ok ? 0 : 1;
}

