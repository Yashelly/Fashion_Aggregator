import path from "node:path";
import { readCsvFile } from "@/lib/csv";
import { getPublicDemoStoreById, type PublicDemoStore } from "@/lib/demo-stores";
import type { MockProduct } from "@/lib/mock-products";

/**
 * Cross-store comparison: the same item, in every store that carries it, with
 * price and size availability side by side.
 *
 * IDENTITY — how do we know two listings are the same item?
 *
 * Here, by construction: `data/mock_listings.csv` keys every listing to a
 * `mock_product_id`, so identity is given rather than inferred. That is only
 * true because the listings are synthetic (see `scripts/generate-listings.mjs`
 * for why they had to be — the demo catalog has one store and no repeated
 * items, so there was nothing to compare).
 *
 * With a real feed identity has to be *earned*, and no amount of UI work here
 * substitutes for it. The tiered strategy is specified in
 * `docs/feed-format-research-2026-07-31.md`: GTIN/EAN exact match first,
 * brand + MPN second, embedding similarity over title/image third, manual
 * review for whatever is left. This module is deliberately shaped so that only
 * `loadListings` changes when that day comes — the comparison logic below is
 * indifferent to where identity came from.
 */

export type StoreListing = {
  listingId: string;
  store: PublicDemoStore;
  priceEur: number;
  oldPriceEur: number | null;
  currency: string;
  sizes: string[];
  availability: string;
  /** True for the listing that belongs to the product's own store. */
  isBase: boolean;
};

export type ProductComparison = {
  listings: StoreListing[];
  storeCount: number;
  lowestPrice: number;
  highestPrice: number;
  /** Money saved by buying at the cheapest store instead of the dearest. */
  spread: number;
  /** Sizes carried by at least one store but not by all of them. */
  sizesNotEverywhere: string[];
};

type ListingRow = {
  listing_id: string;
  mock_product_id: string;
  demo_store_id: string;
  price_eur: string;
  old_price_eur: string;
  currency: string;
  size_options: string;
  availability: string;
};

const listingsPath = path.join(process.cwd(), "data", "mock_listings.csv");

let cachedListings: Map<string, ListingRow[]> | null = null;

function loadListings(): Map<string, ListingRow[]> {
  if (cachedListings) return cachedListings;

  const byProduct = new Map<string, ListingRow[]>();

  // The file is optional: `readCsvFile` returns [] when it is absent, in which
  // case every product simply reports one store — the truthful answer for a
  // catalog with no overlap.
  for (const listing of readCsvFile<ListingRow>(listingsPath)) {
    // A listing pointing at a store id we do not publish is dropped rather than
    // rendered, so the public store vocabulary stays closed.
    if (!getPublicDemoStoreById(listing.demo_store_id)) continue;

    const existing = byProduct.get(listing.mock_product_id);
    if (existing) existing.push(listing);
    else byProduct.set(listing.mock_product_id, [listing]);
  }

  cachedListings = byProduct;
  return byProduct;
}

function splitSizes(value: string): string[] {
  return value.split("|").filter(Boolean);
}

/**
 * Every store carrying this product, cheapest first, with the product's own
 * store included as the base listing.
 */
export function getProductListings(product: MockProduct): StoreListing[] {
  const baseStore = getPublicDemoStoreById(product.public_store_id);
  const listings: StoreListing[] = [];

  if (baseStore) {
    listings.push({
      listingId: `${product.mock_product_id}-base`,
      store: baseStore,
      priceEur: Number(product.price_eur),
      oldPriceEur: product.old_price_eur ? Number(product.old_price_eur) : null,
      currency: product.currency,
      sizes: splitSizes(product.size_options),
      availability: product.availability,
      isBase: true,
    });
  }

  for (const row of loadListings().get(product.mock_product_id) ?? []) {
    const store = getPublicDemoStoreById(row.demo_store_id);
    if (!store || store.id === product.public_store_id) continue;

    listings.push({
      listingId: row.listing_id,
      store,
      priceEur: Number(row.price_eur),
      oldPriceEur: row.old_price_eur ? Number(row.old_price_eur) : null,
      currency: row.currency || product.currency,
      sizes: splitSizes(row.size_options),
      availability: row.availability,
      isBase: false,
    });
  }

  return listings.sort((first, second) => first.priceEur - second.priceEur);
}

/**
 * Comparison summary, or `null` when the item is carried by a single store —
 * there is nothing to compare, and showing a one-row "comparison" would imply
 * a choice the shopper does not have.
 */
export function compareProductAcrossStores(product: MockProduct): ProductComparison | null {
  const listings = getProductListings(product);
  if (listings.length < 2) return null;

  const prices = listings.map((listing) => listing.priceEur);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);

  const sizeCounts = new Map<string, number>();
  for (const listing of listings) {
    for (const size of new Set(listing.sizes)) {
      sizeCounts.set(size, (sizeCounts.get(size) ?? 0) + 1);
    }
  }
  const sizesNotEverywhere = [...sizeCounts.entries()]
    .filter(([, count]) => count < listings.length)
    .map(([size]) => size);

  return {
    listings,
    storeCount: listings.length,
    lowestPrice,
    highestPrice,
    spread: Number((highestPrice - lowestPrice).toFixed(2)),
    sizesNotEverywhere,
  };
}

/** Compact signal for product cards: how many stores, and the best price. */
export function summariseAvailability(product: MockProduct) {
  const listings = getProductListings(product);
  if (listings.length < 2) return null;

  return {
    storeCount: listings.length,
    lowestPrice: Math.min(...listings.map((listing) => listing.priceEur)),
    currency: listings[0].currency,
  };
}
