import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import {
  buildImportPlan,
  parseDelimitedRecords,
} from "./feed-import-core.mjs";
import { applyImportPlan } from "./feed-import-postgres.mjs";
import { loadLocalEnv } from "./cloud-search-providers.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(rootDir, "data", "mock_products.csv");
const demoStoreCount = 6;

const config = {
  version: 1,
  name: "weft-demo-catalog-v1",
  format: "json",
  fields: {
    external_product_id: ["mock_product_id"],
    title: ["title"],
    brand: ["brand"],
    description: ["notes"],
    merchant_category: ["category"],
    subcategory: ["subcategory"],
    gender: ["gender"],
    color_label: ["color"],
    style_tags: ["style_tags"],
    product_url: ["mock_url"],
    image_url: ["image_url"],
    currency: ["currency"],
    price: ["price_eur"],
    old_price: ["old_price_eur"],
    availability: ["availability"],
    size_summary: ["size_options"],
  },
  defaults: { currency: "EUR" },
  availabilityMap: {
    in_stock: { in_stock: true, status: "active" },
    limited: { in_stock: true, status: "active" },
    out_of_stock: { in_stock: false, status: "out_of_stock" },
  },
};

function publicStoreIdFor(productId) {
  const numericId = Number(productId.match(/\d+/)?.[0] ?? 1);
  const number = String((Math.max(1, numericId) - 1) % demoStoreCount + 1).padStart(2, "0");
  return `demo-store-${number}`;
}

function privateStoreSlug(publicStoreId) {
  return `weft_${publicStoreId.replaceAll("-", "_")}`;
}

function postgresSsl(databaseUrl) {
  const host = new URL(databaseUrl).hostname;
  return new Set(["127.0.0.1", "::1", "localhost"]).has(host) ? false : "require";
}

export function prepareDemoCatalogPlans() {
  const rows = parseDelimitedRecords(fs.readFileSync(catalogPath, "utf8"));
  const demoRows = rows.filter((row) => row.source_status === "mock_not_live");
  if (demoRows.length !== rows.length || demoRows.length === 0) {
    throw new Error("Demo catalog seed accepts only non-empty mock_not_live input");
  }

  return Array.from({ length: demoStoreCount }, (_, index) => {
    const publicStoreId = `demo-store-${String(index + 1).padStart(2, "0")}`;
    const storeRows = demoRows.filter(
      (row) => publicStoreIdFor(row.mock_product_id) === publicStoreId,
    );
    const plan = buildImportPlan(JSON.stringify(storeRows), config, {
      allowRelativeDemoUrls: true,
    });
    if (!plan.summary.canApply || plan.summary.publicRows !== storeRows.length) {
      throw new Error(`Demo catalog plan failed validation for ${publicStoreId}`);
    }
    return {
      plan,
      publicStoreId,
      storeSlug: privateStoreSlug(publicStoreId),
    };
  });
}

export async function applyDemoCatalog({ databaseUrl }) {
  const plans = prepareDemoCatalogPlans();
  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: postgresSsl(databaseUrl),
  });
  try {
    for (const { publicStoreId, storeSlug } of plans) {
      await sql`
        insert into public.stores (
          slug, display_name, affiliate_status, feed_status,
          public_listing_status, public_id
        ) values (
          ${storeSlug}, ${`Synthetic ${publicStoreId}`},
          'target', 'not_available', 'demo', ${publicStoreId}
        )
        on conflict (slug) do update set
          display_name = excluded.display_name,
          public_id = excluded.public_id
      `;
    }
  } finally {
    await sql.end();
  }

  const totals = { inserted: 0, outOfStock: 0, unchanged: 0, updated: 0 };
  for (const { plan, publicStoreId, storeSlug } of plans) {
    const result = await applyImportPlan({
      databaseUrl,
      fullSnapshot: true,
      plan,
      sourceFormat: "json",
      sourceLabel: `fixture:mock_products.csv#${publicStoreId}`,
      sourceType: "manual_mock",
      storeSlug,
    });
    for (const key of Object.keys(totals)) totals[key] += result[key];
  }
  return { ...totals, stores: plans.length };
}

async function main() {
  loadLocalEnv(rootDir);
  const plans = prepareDemoCatalogPlans();
  const rowCount = plans.reduce((total, item) => total + item.plan.summary.publicRows, 0);
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ mode: "dry-run", products: rowCount, stores: plans.length }, null, 2));
    return;
  }
  const databaseUrl = process.env.SUPABASE_DB_URL?.trim();
  if (!databaseUrl) throw new Error("SUPABASE_DB_URL is required with --apply");
  const result = await applyDemoCatalog({ databaseUrl });
  console.log(JSON.stringify({ mode: "applied", products: rowCount, ...result }, null, 2));
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
