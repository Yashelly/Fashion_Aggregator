import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const safeNamePattern = /^[a-z0-9][a-z0-9-]{0,63}$/;
const safeStorePattern = /^[a-z0-9][a-z0-9_-]{0,99}$/;
const sourceTypes = new Set(["affiliate_feed", "direct_partner_feed"]);

function requiredEnv(env, name) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function resolveFeedOperation(env = process.env) {
  const profile = requiredEnv(env, "FEED_PROFILE");
  const store = requiredEnv(env, "FEED_STORE_SLUG");
  const sourceType = requiredEnv(env, "FEED_SOURCE_TYPE");
  const sourceUrl = requiredEnv(env, "FEED_SOURCE_URL");
  const apply = env.FEED_APPLY === "true";
  const fullSnapshot = env.FEED_FULL_SNAPSHOT !== "false";

  if (!safeNamePattern.test(profile)) throw new Error("FEED_PROFILE has an invalid name");
  if (!safeStorePattern.test(store)) throw new Error("FEED_STORE_SLUG has an invalid value");
  if (!sourceTypes.has(sourceType)) throw new Error("FEED_SOURCE_TYPE is not production-safe");

  let source;
  try {
    source = new URL(sourceUrl);
  } catch {
    throw new Error("FEED_SOURCE_URL must be a valid HTTPS URL");
  }
  if (source.protocol !== "https:" || source.username || source.password) {
    throw new Error("FEED_SOURCE_URL must be HTTPS and must not contain embedded credentials");
  }

  const configPath = path.join(rootDir, "data", "feed-configs", `${profile}.json`);
  if (!fs.existsSync(configPath)) throw new Error(`Unknown feed profile: ${profile}`);

  const args = [
    path.join(rootDir, "scripts", "import-feed.mjs"),
    "--source-env", "FEED_SOURCE_URL",
    "--config", path.relative(rootDir, configPath),
    "--store", store,
    "--source-type", sourceType,
  ];
  const sourceLabel = env.FEED_SOURCE_LABEL?.trim();
  if (sourceLabel) args.push("--source-label", sourceLabel);
  if (env.FEED_AUTHORIZATION?.trim()) {
    args.push("--authorization-env", "FEED_AUTHORIZATION");
  }
  if (!fullSnapshot) args.push("--partial");
  args.push(apply ? "--apply" : "--dry-run");

  const childEnv = { ...env };
  if (apply) {
    if (env.FEED_APPLY_CONFIRMATION !== "IMPORT_APPROVED_FEED") {
      throw new Error("Apply requires FEED_APPLY_CONFIRMATION=IMPORT_APPROVED_FEED");
    }
    const databaseUrl = requiredEnv(env, "SUPABASE_IMPORT_DB_URL");
    let database;
    try {
      database = new URL(databaseUrl);
    } catch {
      throw new Error("SUPABASE_IMPORT_DB_URL is not a valid Postgres URL");
    }
    const username = decodeURIComponent(database.username);
    const isPooler = database.hostname.endsWith(".pooler.supabase.com");
    let validRole = username === "weft_feed_importer";
    if (isPooler) {
      let supabaseUrl;
      try {
        supabaseUrl = new URL(requiredEnv(env, "SUPABASE_URL"));
      } catch {
        throw new Error("SUPABASE_URL is not a valid project URL");
      }
      const projectRef = supabaseUrl.hostname.split(".")[0];
      validRole = username === `weft_feed_importer.${projectRef}`;
    }
    if (!validRole) {
      throw new Error("SUPABASE_IMPORT_DB_URL must use the weft_feed_importer role for this project");
    }
    childEnv.SUPABASE_DB_URL = databaseUrl;
  } else {
    delete childEnv.SUPABASE_DB_URL;
  }

  return { apply, args, childEnv, fullSnapshot, profile, sourceType };
}

export async function runFeedOperation(env = process.env) {
  const operation = resolveFeedOperation(env);
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, operation.args, {
      cwd: rootDir,
      env: operation.childEnv,
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Feed operation failed${signal ? ` (${signal})` : ` with exit code ${code}`}`));
    });
  });
  if (env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(env.GITHUB_STEP_SUMMARY, [
      "## Feed operation",
      "",
      `- Mode: ${operation.apply ? "apply" : "dry-run"}`,
      `- Profile: ${operation.profile}`,
      `- Source type: ${operation.sourceType}`,
      `- Full snapshot: ${operation.fullSnapshot}`,
      "- Feed URL and authorization: redacted",
      "",
    ].join("\n"));
  }
  return operation;
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await runFeedOperation();
