/**
 * Generates `data/mock_listings.csv` — the synthetic multi-store listings that
 * cross-store comparison runs on.
 *
 * WHY THIS FILE EXISTS
 *
 * The comparison feature answers "the same item, in several stores, with the
 * prices side by side". The demo catalog could not answer it: all 64 rows in
 * `data/mock_products.csv` belong to one store, and no two rows are the same
 * item (verified — zero duplicate title+brand pairs). There was literally
 * nothing to compare.
 *
 * So the extra listings are generated rather than observed. That is a real
 * limitation and it is stated in the UI: the comparison surface is honest about
 * being a demo of the mechanism, not a price quote. Generating them is inside
 * the demo-data boundary — every listing is synthetic, carries no retailer
 * identity, and is attached to a public `demo-store-NN` id. No internal
 * retailer slug is invented, because no real retailer is involved.
 *
 * The output is committed so the catalog stays deterministic and reviewable.
 * Re-run only when the base catalog changes:
 *
 *   node scripts/generate-listings.mjs
 *
 * When a real affiliate feed arrives this file is deleted, not extended — the
 * listings come from the feed and identity matching moves to GTIN / brand+MPN /
 * embedding similarity as researched in `docs/feed-format-research-2026-07-31.md`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_STORE_COUNT = 6;

/** Deterministic PRNG so regenerating the file produces an identical diff. */
function mulberry32(seed) {
  return function random() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && inQuotes && line[index + 1] === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

/** Mirrors `getPublicDemoStoreForProduct`'s fallback in lib/demo-stores.ts. */
function baseStoreIndex(productId) {
  const numeric = Number(productId.match(/\d+/)?.[0] ?? 1);
  return (Math.max(1, numeric) - 1) % PUBLIC_STORE_COUNT;
}

function storeId(index) {
  return `demo-store-${String(index + 1).padStart(2, "0")}`;
}

const csv = fs.readFileSync(path.join(rootDir, "data", "mock_products.csv"), "utf8").trim();
const [headerLine, ...rows] = csv.split(/\r?\n/);
const headers = parseCsvLine(headerLine);
const products = rows
  .map((row) => {
    const values = parseCsvLine(row);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  })
  .filter((product) => product.source_status === "mock_not_live");

const random = mulberry32(20260801);
const listings = [];
let sequence = 0;

for (const product of products) {
  // Roughly half the catalog is stocked in more than one store, which is the
  // shape a real aggregated feed has — universal overlap would be unrealistic
  // and would hide the "only in one store" case from the UI.
  if (random() > 0.55) continue;

  const basePrice = Number(product.price_eur);
  const baseIndex = baseStoreIndex(product.mock_product_id);
  const extraCount = random() > 0.65 ? 2 : 1;
  const used = new Set([baseIndex]);

  for (let n = 0; n < extraCount; n += 1) {
    let index = Math.floor(random() * PUBLIC_STORE_COUNT);
    let guard = 0;
    while (used.has(index) && guard < PUBLIC_STORE_COUNT) {
      index = (index + 1) % PUBLIC_STORE_COUNT;
      guard += 1;
    }
    if (used.has(index)) break;
    used.add(index);

    // ±22% around the base price, rounded to the usual .99/.49 endings.
    const factor = 0.78 + random() * 0.44;
    const raw = basePrice * factor;
    const price = (Math.max(4, Math.round(raw) - 0.01)).toFixed(2);

    // A store that stocks the item usually carries a subset of the sizes.
    const allSizes = product.size_options.split("|").filter(Boolean);
    const keep = allSizes.filter(() => random() > 0.22);
    const sizes = (keep.length > 0 ? keep : allSizes.slice(0, 1)).join("|");

    const roll = random();
    const availability = roll > 0.86 ? "out_of_stock" : roll > 0.68 ? "limited" : "in_stock";

    // Discounts are less common on secondary listings than on the base row.
    const onSale = random() > 0.72;
    const oldPrice = onSale ? (Number(price) * (1.15 + random() * 0.25)).toFixed(2) : "";

    sequence += 1;
    listings.push({
      listing_id: `LST-${String(sequence).padStart(3, "0")}`,
      mock_product_id: product.mock_product_id,
      demo_store_id: storeId(index),
      price_eur: price,
      old_price_eur: oldPrice,
      currency: product.currency,
      size_options: sizes,
      availability,
    });
  }
}

const outHeaders = [
  "listing_id",
  "mock_product_id",
  "demo_store_id",
  "price_eur",
  "old_price_eur",
  "currency",
  "size_options",
  "availability",
];
const body = listings
  .map((listing) => outHeaders.map((header) => `"${listing[header]}"`).join(","))
  .join("\n");
const output = `${outHeaders.map((header) => `"${header}"`).join(",")}\n${body}\n`;

fs.writeFileSync(path.join(rootDir, "data", "mock_listings.csv"), output, "utf8");

const productsWithExtras = new Set(listings.map((listing) => listing.mock_product_id));
console.log(`Wrote data/mock_listings.csv`);
console.log(`  extra listings   ${listings.length}`);
console.log(`  products covered ${productsWithExtras.size} of ${products.length}`);
