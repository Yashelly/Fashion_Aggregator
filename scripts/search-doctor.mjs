import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnv } from "./cloud-search-providers.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadLocalEnv(rootDir);

const checks = {
  NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
  SUPABASE_DB_URL: Boolean(process.env.SUPABASE_DB_URL?.trim()),
  SUPABASE_SECRET_KEY: Boolean(process.env.SUPABASE_SECRET_KEY?.trim()),
  GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY?.trim()),
};

for (const [name, present] of Object.entries(checks)) {
  console.log(`${name}: ${present ? "SET" : "MISSING"}`);
}

if (!checks.NEXT_PUBLIC_SUPABASE_URL || !checks.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log("Remote search index: SKIPPED (public Supabase env is incomplete)");
  process.exitCode = 1;
} else {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL.trim().replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();
  try {
    const response = await fetch(
      `${url}/rest/v1/search_product_documents?select=product_id&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: "count=exact",
        },
      },
    );
    const contentRange = response.headers.get("content-range");
    const count = contentRange?.split("/")[1];
    if (response.ok) {
      console.log(`Remote search index: READY (${count && count !== "*" ? count : "unknown"} public documents)`);
      if (count === "0") process.exitCode = 1;
    } else {
      const body = await response.json().catch(() => ({}));
      console.log(`Remote search index: NOT READY (${response.status} ${body.code ?? response.statusText})`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.log(`Remote search index: UNREACHABLE (${error instanceof Error ? error.name : "unknown error"})`);
    process.exitCode = 1;
  }
}

if (!checks.SUPABASE_SECRET_KEY && !checks.SUPABASE_DB_URL) {
  console.log("Indexer connection: MISSING (set SUPABASE_SECRET_KEY, or fallback SUPABASE_DB_URL)");
  process.exitCode = 1;
} else {
  console.log(`Indexer connection: READY (${checks.SUPABASE_SECRET_KEY ? "Data API secret key" : "direct Postgres fallback"})`);
}
