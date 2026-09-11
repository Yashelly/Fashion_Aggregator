import assert from "node:assert/strict";
import postgres from "postgres";
import { applyDemoCatalog } from "./seed-demo-catalog.mjs";

const databaseUrl = process.env.TEST_DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required");
const parsedDatabaseUrl = new URL(databaseUrl);
if (!new Set(["127.0.0.1", "::1", "localhost"]).has(parsedDatabaseUrl.hostname)) {
  throw new Error("Refusing to run catalog integration tests against a non-local database");
}
if (parsedDatabaseUrl.pathname !== "/weft_test") {
  throw new Error("Catalog integration tests require the dedicated weft_test database");
}

const sql = postgres(databaseUrl, { max: 1, prepare: false, ssl: false });

async function publicCatalogRows() {
  return sql.begin(async (transaction) => {
    await transaction.unsafe("set local role anon");
    return transaction`
      select * from public.catalog_products order by public_product_id
    `;
  });
}

try {
  const first = await applyDemoCatalog({ databaseUrl });
  assert.deepEqual(first, {
    inserted: 64,
    outOfStock: 0,
    stores: 6,
    unchanged: 0,
    updated: 0,
  });
  const second = await applyDemoCatalog({ databaseUrl });
  assert.deepEqual(second, {
    inserted: 0,
    outOfStock: 0,
    stores: 6,
    unchanged: 64,
    updated: 0,
  });

  let rows = await publicCatalogRows();
  assert.equal(rows.length, 64);
  assert.equal(rows[0].public_product_id, "MOCK-001");
  assert.equal(rows[0].public_store_id, "demo-store-01");
  assert.equal(rows[0].source_status, "mock_not_live");
  assert.equal(rows[0].image_url, "/demo-products/product-01.webp");
  assert.equal(rows[0].mock_url, "/out/MOCK-001");
  assert.equal("source_product_id" in rows[0], false);
  assert.equal("source_store_id" in rows[0], false);
  assert.equal("store_slug" in rows[0], false);

  const [{ can_read_hidden_id: canReadHiddenId }] = await sql`
    select has_column_privilege(
      'anon', 'private.catalog_product_rows', 'source_store_id', 'select'
    ) as can_read_hidden_id
  `;
  assert.equal(canReadHiddenId, false);

  await sql`
    update public.products set status = 'blocked'
    where external_product_id = 'MOCK-001'
  `;
  assert.equal((await publicCatalogRows()).length, 63);

  const restored = await applyDemoCatalog({ databaseUrl });
  assert.equal(restored.unchanged, 64);
  assert.equal((await publicCatalogRows()).length, 64);

  await sql`
    update public.stores set public_listing_status = 'paused'
    where public_id = 'demo-store-01'
  `;
  rows = await publicCatalogRows();
  assert.equal(rows.some((row) => row.public_store_id === "demo-store-01"), false);

  await sql`
    update public.stores set public_listing_status = 'demo'
    where public_id = 'demo-store-01'
  `;
  assert.equal((await publicCatalogRows()).length, 64);

  console.log("Supabase catalog PostgreSQL integration: PASS");
  console.log(JSON.stringify({ products: 64, stores: 6, scenarios: 5 }));
} finally {
  await sql.end();
}
