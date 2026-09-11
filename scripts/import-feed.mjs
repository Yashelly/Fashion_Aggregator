import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildImportPlan } from "./feed-import-core.mjs";
import { applyImportPlan } from "./feed-import-postgres.mjs";
import { loadLocalEnv } from "./cloud-search-providers.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_FEED_BYTES = 25 * 1024 * 1024;
loadLocalEnv(rootDir);

function parseArgs(argv) {
  const options = { apply: false, fullSnapshot: true, sourceType: "affiliate_feed" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") options.apply = true;
    else if (arg === "--dry-run") options.apply = false;
    else if (arg === "--partial") options.fullSnapshot = false;
    else if (arg === "--help") options.help = true;
    else if (arg.startsWith("--")) {
      const name = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
      options[name] = value;
      index += 1;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  return options;
}

function help() {
  console.log(`Usage:
  node scripts/import-feed.mjs --source <path|https-url> --config <mapping.json> [--dry-run]
  node scripts/import-feed.mjs --source-env <ENV_NAME> --config <mapping.json> --apply --store <slug>

Options:
  --apply                    Write an already-valid plan to Supabase/Postgres
  --authorization-env NAME   Read an Authorization header value from NAME
  --partial                  Do not mark missing products out of stock
  --source-label LABEL       Non-secret audit label stored with the import run
  --source-type TYPE         affiliate_feed, direct_partner_feed, or manual_mock

Dry-run is the default. Remote sources must use HTTPS. Feed URLs and auth values
may be supplied through environment variables and are never printed.`);
}

function sourceFromOptions(options) {
  if (options.source && options.sourceEnv) throw new Error("Use --source or --source-env, not both");
  if (options.sourceEnv) {
    const value = process.env[options.sourceEnv]?.trim();
    if (!value) throw new Error(`Environment variable ${options.sourceEnv} is missing`);
    return value;
  }
  if (!options.source) throw new Error("--source or --source-env is required");
  return options.source;
}

async function readSource(source, authorizationEnv) {
  let remote;
  try {
    remote = new URL(source);
  } catch {
    const filePath = path.resolve(rootDir, source);
    const size = fs.statSync(filePath).size;
    if (size > MAX_FEED_BYTES) throw new Error("Feed exceeds the 25 MiB MVP limit");
    return fs.readFileSync(filePath, "utf8");
  }

  if (remote.protocol !== "https:") throw new Error("Remote feeds must use HTTPS");
  if (remote.username || remote.password) throw new Error("Feed URL must not contain embedded credentials");
  const headers = {};
  if (authorizationEnv) {
    const authorization = process.env[authorizationEnv]?.trim();
    if (!authorization) throw new Error(`Environment variable ${authorizationEnv} is missing`);
    headers.Authorization = authorization;
  }
  const response = await fetch(remote, {
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Feed download failed with HTTP ${response.status}`);
  if (new URL(response.url).protocol !== "https:") throw new Error("Feed redirected to a non-HTTPS URL");
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FEED_BYTES) {
    await response.body?.cancel();
    throw new Error("Feed exceeds the 25 MiB MVP limit");
  }
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_FEED_BYTES) {
      await reader.cancel();
      throw new Error("Feed exceeds the 25 MiB MVP limit");
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

function auditSourceLabel(source, explicitLabel) {
  if (explicitLabel) {
    if (explicitLabel.length > 200 || /[?@]/.test(explicitLabel)) {
      throw new Error("--source-label must be a short non-secret label without ? or @");
    }
    return explicitLabel;
  }
  try {
    const url = new URL(source);
    return `${url.origin}/[redacted]`;
  } catch {
    return `fixture:${path.basename(source)}`;
  }
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  help();
  process.exit(0);
}

const source = sourceFromOptions(options);
if (!options.config) throw new Error("--config is required");
const configPath = path.resolve(rootDir, options.config);
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const text = await readSource(source, options.authorizationEnv);
const plan = buildImportPlan(text, config, {
  allowRelativeDemoUrls: options.sourceType === "manual_mock",
});
const report = {
  config: config.name ?? path.basename(configPath),
  feedHash: plan.feedHash,
  reviewRows: plan.rows
    .filter((row) => !new Set(["valid", "warning"]).has(row.validationStatus))
    .map((row) => ({
      errors: row.validationErrors,
      externalProductId: row.normalizedPayload.external_product_id || null,
      rowNumber: row.rowNumber,
      status: row.validationStatus,
    })),
  mode: options.apply ? "apply" : "dry-run",
  source: auditSourceLabel(source, options.sourceLabel),
  summary: plan.summary,
};
console.log(JSON.stringify(report, null, 2));

if (!plan.summary.canApply) {
  throw new Error("Feed failed validation: no public rows or invalid rate exceeds 30%");
}

if (options.apply) {
  if (!options.store) throw new Error("--store is required with --apply");
  const databaseUrl = process.env.SUPABASE_DB_URL?.trim();
  if (!databaseUrl) throw new Error("SUPABASE_DB_URL is required with --apply");
  const result = await applyImportPlan({
    databaseUrl,
    fullSnapshot: options.fullSnapshot,
    plan,
    sourceFormat: config.format,
    sourceLabel: report.source,
    sourceType: options.sourceType,
    storeSlug: options.store,
  });
  console.log(JSON.stringify({ mode: "applied", ...result }, null, 2));
}
