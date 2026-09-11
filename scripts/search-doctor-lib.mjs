import postgres from "postgres";

function postgresSsl(databaseUrl) {
  const host = new URL(databaseUrl).hostname;
  return new Set(["127.0.0.1", "::1", "localhost"]).has(host) ? false : "require";
}

export function safeConnectionError(error) {
  if (error?.code === "28P01") return "authentication failed";
  if (new Set(["ECONNREFUSED", "ENETUNREACH", "ENOTFOUND", "ETIMEDOUT"]).has(error?.code)) {
    return "unreachable";
  }
  if (error?.name === "AbortError" || error?.name === "TimeoutError") return "timed out";
  return `connection error${error?.code ? ` (${error.code})` : ""}`;
}

export async function checkPostgresConnection(databaseUrl) {
  const sql = postgres(databaseUrl, {
    connect_timeout: 5,
    idle_timeout: 2,
    max: 1,
    prepare: false,
    ssl: postgresSsl(databaseUrl),
  });
  try {
    const [result] = await sql`
      select current_database() is not null as connected
    `;
    if (!result?.connected) throw new Error("Postgres health query returned no row");
    return { backend: "direct Postgres", ready: true };
  } catch (error) {
    return { backend: "direct Postgres", detail: safeConnectionError(error), ready: false };
  } finally {
    await sql.end({ timeout: 1 }).catch(() => undefined);
  }
}

export async function checkDataApiConnection(supabaseUrl, secretKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/rest/v1/search_product_documents?select=product_id&limit=1`,
      {
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      return {
        backend: "Supabase Data API secret key",
        detail: response.status === 401 || response.status === 403
          ? "authentication or table-access failed"
          : `HTTP ${response.status}`,
        ready: false,
      };
    }
    return { backend: "Supabase Data API secret key", ready: true };
  } catch (error) {
    return {
      backend: "Supabase Data API secret key",
      detail: safeConnectionError(error),
      ready: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}
