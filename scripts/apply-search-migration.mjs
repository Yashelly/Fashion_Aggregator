import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { loadLocalEnv } from "./cloud-search-providers.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationPath = path.join(rootDir, "sql", "004_search_vector_index.sql");
loadLocalEnv(rootDir);

const databaseUrl = process.env.SUPABASE_DB_URL?.trim();
if (!databaseUrl) {
  throw new Error("SUPABASE_DB_URL is required (Supabase Connect -> Session pooler)");
}

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: "require",
});

try {
  await sql.unsafe(fs.readFileSync(migrationPath, "utf8"));
  console.log("Applied sql/004_search_vector_index.sql");
} finally {
  await sql.end();
}
