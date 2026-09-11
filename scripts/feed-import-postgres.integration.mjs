import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import postgres from "postgres";
import { buildImportPlan } from "./feed-import-core.mjs";
import { applyImportPlan } from "./feed-import-postgres.mjs";
import { checkPostgresConnection } from "./search-doctor-lib.mjs";

const rootDir = process.cwd();
const databaseUrl = process.env.TEST_DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required");
const parsedDatabaseUrl = new URL(databaseUrl);
if (!new Set(["127.0.0.1", "::1", "localhost"]).has(parsedDatabaseUrl.hostname)) {
  throw new Error("Refusing to run feed integration tests against a non-local database");
}
if (parsedDatabaseUrl.pathname !== "/weft_test") {
  throw new Error("Feed integration tests require the dedicated weft_test database");
}

const config = JSON.parse(fs.readFileSync(
  path.join(rootDir, "data", "feed-configs", "weft-test-feed.json"),
  "utf8",
));
const fixture = fs.readFileSync(
  path.join(rootDir, "data", "feed-fixtures", "weft-test-feed.csv"),
  "utf8",
);
const sql = postgres(databaseUrl, { max: 1, prepare: false, ssl: false });

function withoutRow(text, externalProductId) {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.startsWith(`${externalProductId},`))
    .join("\n");
}

async function apply(text, { fullSnapshot = true } = {}) {
  const plan = buildImportPlan(text, config);
  return applyImportPlan({
    databaseUrl,
    fullSnapshot,
    plan,
    sourceFormat: config.format,
    sourceLabel: "fixture:weft-test-feed.csv",
    sourceType: "manual_mock",
    storeSlug: "weft_import_ci",
  });
}

async function rowFor(externalProductId) {
  const [row] = await sql`
    select external_product_id, price::text, status, in_stock, content_hash
    from public.products
    where external_product_id = ${externalProductId}
  `;
  return row;
}

try {
  await sql.unsafe("create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;");
  for (const migration of [
    "001_pre_affiliate_schema.sql",
    "002_pre_affiliate_hardening.sql",
    "003_synthetic_click_boundary.sql",
    "005_public_catalog_read_model.sql",
  ]) {
    await sql.unsafe(fs.readFileSync(path.join(rootDir, "sql", migration), "utf8"));
  }
  await sql`
    insert into public.stores (
      slug, display_name, affiliate_status, feed_status, public_listing_status
    ) values (
      'weft_import_ci', 'Synthetic CI Store', 'target', 'not_available', 'demo'
    )
  `;

  const doctor = await checkPostgresConnection(databaseUrl);
  assert.deepEqual(doctor, { backend: "direct Postgres", ready: true });

  const first = await apply(fixture);
  assert.deepEqual(
    { inserted: first.inserted, outOfStock: first.outOfStock, unchanged: first.unchanged, updated: first.updated },
    { inserted: 4, outOfStock: 0, unchanged: 0, updated: 0 },
  );
  const second = await apply(fixture);
  assert.deepEqual(
    { inserted: second.inserted, unchanged: second.unchanged, updated: second.updated },
    { inserted: 0, unchanged: 4, updated: 0 },
  );

  const changedPrice = fixture.replace(
    "https://merchant.invalid/images/test-002.webp,EUR,89.00,69.00",
    "https://merchant.invalid/images/test-002.webp,EUR,79.00,69.00",
  );
  const changed = await apply(changedPrice, { fullSnapshot: false });
  assert.deepEqual(
    { inserted: changed.inserted, unchanged: changed.unchanged, updated: changed.updated },
    { inserted: 0, unchanged: 3, updated: 1 },
  );
  assert.equal((await rowFor("TEST-002")).price, "79.00");

  const missingActiveProduct = withoutRow(changedPrice, "TEST-001");
  const missing = await apply(missingActiveProduct);
  assert.equal(missing.outOfStock, 1);
  const missingRow = await rowFor("TEST-001");
  assert.equal(missingRow.status, "out_of_stock");
  assert.equal(missingRow.in_stock, false);
  assert.equal(missingRow.content_hash, null);

  const restored = await apply(changedPrice);
  assert.equal(restored.updated, 1);
  assert.equal((await rowFor("TEST-001")).status, "demo");

  const missingImage = changedPrice.replace(
    "https://merchant.invalid/images/test-002.webp",
    "",
  );
  const skipped = await apply(missingImage, { fullSnapshot: false });
  assert.equal(skipped.updated, 1);
  assert.equal((await rowFor("TEST-002")).status, "blocked");

  const restoredSkipped = await apply(changedPrice, { fullSnapshot: false });
  assert.equal(restoredSkipped.unchanged, 4);
  assert.equal((await rowFor("TEST-002")).status, "demo");

  const [{ product_count: productCount }] = await sql`
    select count(*)::integer as product_count from public.products
  `;
  const [{ run_count: runCount }] = await sql`
    select count(*)::integer as run_count
    from public.feed_import_runs
    where status = 'completed'
  `;
  const [{ raw_count: rawCount }] = await sql`
    select count(*)::integer as raw_count from public.raw_feed_items
  `;
  assert.equal(productCount, 4);
  assert.equal(runCount, 7);
  assert.equal(rawCount, 34);

  console.log("Feed importer PostgreSQL integration: PASS");
  console.log(JSON.stringify({ productCount, rawCount, runCount, scenarios: 7 }));
} finally {
  await sql.end();
}
