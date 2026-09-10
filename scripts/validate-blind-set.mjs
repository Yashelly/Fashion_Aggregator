/**
 * Structural validator for a prospective sealed blind search set.
 *
 * This file intentionally does not load the search engine or run any query.
 * It can therefore be used to review/freeze a new set before its first score.
 *
 * Usage:
 *   node scripts/validate-blind-set.mjs --set=scripts/final-blind-v2-queries.mjs --export=FINAL_BLIND_SET_V2 --prefix=FB2
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseCsvRecords } from "./csv.mjs";
import {
  DEV_SET,
  HISTORICAL_BLIND_SET_2026_08_27,
  REGRESSION_SET,
} from "./search-queries.mjs";
import { CONSUMED_FINAL_BLIND_SET_2026_09_07 } from "./final-blind-queries.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATEGORIES = [
  "ambiguous_conceptual", "color_constraints", "construction_details", "garment_identity",
  "lithuanian_language", "materials_textures", "negatives_exclusions", "occasion_style",
  "price_value", "weather_activity",
];
const STOPWORDS = new Set([
  "a", "an", "and", "for", "i", "in", "is", "me", "my", "of", "on", "please", "some",
  "something", "the", "to", "want", "wear", "with", "ar", "ir", "is", "man", "mano", "noriu", "su",
]);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function significantTokens(value) {
  return normalize(value).split(" ").filter((token) => token && !STOPWORDS.has(token));
}

function nearDuplicateReason(first, second) {
  const left = new Set(significantTokens(first));
  const right = new Set(significantTokens(second));
  const overlap = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  if (normalize(first) === normalize(second)) return "same normalized query";
  if (overlap >= 2 && union > 0 && overlap / union >= 0.8) return "significant-token Jaccard >= 0.80";
  return null;
}

function parseArgs(args) {
  const value = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
  return {
    setPath: value("--set"),
    exportName: value("--export") ?? "FINAL_BLIND_SET_V2",
    prefix: value("--prefix") ?? "FB2",
  };
}

function catalogIds() {
  return new Set(parseCsvRecords(fs.readFileSync(path.join(rootDir, "data", "mock_products.csv"), "utf8"))
    .filter((row) => row.source_status === "mock_not_live")
    .map((row) => row.mock_product_id));
}

export async function validateBlindSet({ setPath, exportName, prefix }) {
  if (!setPath) throw new Error("--set=<module path> is required");
  const absoluteSetPath = path.resolve(rootDir, setPath);
  const module = await import(pathToFileURL(absoluteSetPath).href);
  const cases = module[exportName];
  if (!Array.isArray(cases)) throw new Error(`${exportName} is not an exported array in ${setPath}`);

  const errors = [];
  const ids = catalogIds();
  const categoryCounts = new Map();
  const difficultyCounts = new Map();
  const seenQueries = new Map();
  const seenIds = new Set();
  const prior = [
    ...DEV_SET.map((item) => ({ ...item, source: "DEV" })),
    ...REGRESSION_SET.map((item) => ({ ...item, source: "REGRESSION" })),
    ...HISTORICAL_BLIND_SET_2026_08_27.map((item) => ({ ...item, source: "HISTORICAL" })),
    ...CONSUMED_FINAL_BLIND_SET_2026_09_07.map((item) => ({ ...item, source: "CONSUMED_2026_09_07" })),
  ];

  if (cases.length !== 200) errors.push(`expected 200 cases, found ${cases.length}`);
  for (const [index, item] of cases.entries()) {
    const expectedId = `${prefix}-${String(index + 1).padStart(3, "0")}`;
    if (item.id !== expectedId) errors.push(`case ${index + 1}: expected ${expectedId}, found ${item.id}`);
    if (seenIds.has(item.id)) errors.push(`${item.id}: duplicate ID`);
    seenIds.add(item.id);
    if (!CATEGORIES.includes(item.category)) errors.push(`${item.id}: invalid category`);
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
    if (!["easy", "medium", "adversarial"].includes(item.difficulty)) errors.push(`${item.id}: invalid difficulty`);
    difficultyCounts.set(item.difficulty, (difficultyCounts.get(item.difficulty) ?? 0) + 1);
    if (!["en", "lt"].includes(item.language)) errors.push(`${item.id}: invalid language`);
    if (typeof item.query !== "string" || significantTokens(item.query).length < 2) errors.push(`${item.id}: query lacks meaningful wording`);
    if (typeof item.intent !== "string" || item.intent.length < 6) errors.push(`${item.id}: missing intent`);
    if (typeof item.expectedOutcome !== "string" || item.expectedOutcome.length < 24) errors.push(`${item.id}: expectedOutcome is not reviewable`);
    if (
      typeof item.expectedOutcome === "string" &&
      (/^The catalog-backed acceptable set is /.test(item.expectedOutcome) ||
        item.expectedOutcome === "No catalog product satisfies every stated constraint, so an empty result is expected.")
    ) {
      errors.push(`${item.id}: expectedOutcome is generic rather than case-specific`);
    }
    if (!Array.isArray(item.relevant)) errors.push(`${item.id}: relevant must be an array`);
    if (item.relevant.length === 0 && item.maxResults !== 0) errors.push(`${item.id}: negative cases require maxResults: 0`);
    for (const productId of [...(item.relevant ?? []), ...(item.mustRank ?? []), ...(item.forbiddenTop ?? [])]) {
      if (!ids.has(productId)) errors.push(`${item.id}: unknown catalog ID ${productId}`);
    }
    if ((item.mustRank ?? []).some((productId) => !item.relevant.includes(productId))) errors.push(`${item.id}: mustRank must be relevant`);
    if ((item.forbiddenTop ?? []).some((productId) => item.relevant.includes(productId))) errors.push(`${item.id}: forbiddenTop overlaps relevant`);
    if (item.forbiddenTop && (!Number.isInteger(item.forbiddenTopK) || item.forbiddenTopK < 1)) errors.push(`${item.id}: forbiddenTopK must be positive`);

    const normalized = normalize(item.query);
    if (seenQueries.has(normalized)) errors.push(`${item.id}: duplicate of ${seenQueries.get(normalized)}`);
    seenQueries.set(normalized, item.id);
    for (const older of prior) {
      const reason = nearDuplicateReason(item.query, older.query);
      if (reason) errors.push(`${item.id}: near-duplicate of ${older.source} "${older.query}" (${reason})`);
    }
  }

  for (const category of CATEGORIES) if ((categoryCounts.get(category) ?? 0) !== 20) errors.push(`${category}: expected 20 cases`);
  for (const [difficulty, expected] of [["easy", 60], ["medium", 80], ["adversarial", 60]]) {
    if ((difficultyCounts.get(difficulty) ?? 0) !== expected) errors.push(`${difficulty}: expected ${expected} cases`);
  }
  for (let left = 0; left < cases.length; left += 1) for (let right = left + 1; right < cases.length; right += 1) {
    const reason = nearDuplicateReason(cases[left].query, cases[right].query);
    if (reason) errors.push(`${cases[right].id}: near-duplicate of ${cases[left].id} (${reason})`);
  }

  return {
    ok: errors.length === 0,
    errors,
    caseSetSha256: sha256(`${JSON.stringify(cases, null, 2)}\n`),
    categoryCounts: Object.fromEntries(categoryCounts),
    difficultyCounts: Object.fromEntries(difficultyCounts),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await validateBlindSet(parseArgs(process.argv.slice(2)));
  console.log(`cases              ${Object.values(result.categoryCounts).reduce((total, count) => total + count, 0)}`);
  console.log(`categories         ${JSON.stringify(result.categoryCounts)}`);
  console.log(`difficulties       ${JSON.stringify(result.difficultyCounts)}`);
  console.log(`case set sha256    ${result.caseSetSha256}`);
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  console.log(result.ok ? "STRUCTURE: valid" : "STRUCTURE: invalid");
  process.exitCode = result.ok ? 0 : 1;
}
