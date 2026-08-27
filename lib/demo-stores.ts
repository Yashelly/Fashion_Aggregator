import path from "node:path";
import { readCsvFile } from "@/lib/csv";

export type DemoStoreLocale = "lt" | "en";

export type PublicDemoStore = {
  id: string;
  label: {
    lt: string;
    en: string;
  };
};

type InternalStoreRecord = {
  store_slug: string;
  source_status: string;
};

type ProductStoreReference = {
  mock_product_id: string;
  store_slug: string;
};

const storeTrackerPath = path.join(process.cwd(), "data", "store_tracker.csv");
const publicDemoStoreCount = 6;

/**
 * Internal store slugs that are synthetic demo sources rather than real
 * retailers in `store_tracker.csv`. They are *valid to publish* but are NOT
 * inserted into `publicStoreByInternalSlug` — a synthetic slug resolves through
 * the per-product numeric spread (`getPublicDemoStoreForProduct` fallback), which
 * is what distributes the catalog across all six demo stores. Adding one here
 * that also became a mapped slug would collapse the whole catalog into a single
 * store, so this list governs *validity only*.
 */
const SYNTHETIC_STORE_SLUGS = new Set<string>(["vibewear_demo"]);

function getAllInternalStoreRecords(): InternalStoreRecord[] {
  return readCsvFile<Record<string, string>>(storeTrackerPath)
    .map((record) => ({
      store_slug: record.store_slug,
      source_status: record.source_status,
    }))
    .filter((store) => store.store_slug);
}

const allInternalStores = getAllInternalStoreRecords();

// Suspended slugs are kept as a separate set so a suspended source is
// distinguishable from a genuinely unknown one at classification time — the
// active-store map below deliberately excludes them.
const suspendedStoreSlugs = new Set(
  allInternalStores
    .filter((store) => store.source_status === "market_suspended")
    .map((store) => store.store_slug),
);

const internalStores = allInternalStores
  .filter((store) => store.source_status !== "market_suspended")
  .sort((first, second) => first.store_slug.localeCompare(second.store_slug));

const publicStores: PublicDemoStore[] = Array.from(
  { length: publicDemoStoreCount },
  (_, index) => {
  const number = String(index + 1).padStart(2, "0");

  return {
    id: `demo-store-${number}`,
    label: {
      lt: `Parduotuvė ${number}`,
      en: `Store ${number}`,
    },
  };
  },
);

function stableStoreIndex(value: string) {
  let hash = 0;
  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash % publicStores.length;
}

const publicStoreByInternalSlug = new Map(
  internalStores.map((store) => [
    store.store_slug,
    publicStores[stableStoreIndex(store.store_slug)],
  ]),
);

export function getPublicDemoStores(): PublicDemoStore[] {
  return publicStores.map((store) => ({
    ...store,
    label: { ...store.label },
  }));
}

export function getPublicDemoStoreLabel(
  store: PublicDemoStore,
  locale: DemoStoreLocale,
): string {
  return store.label[locale];
}

export function getPublicDemoStoreById(
  publicStoreId: string,
): PublicDemoStore | undefined {
  return publicStores.find((store) => store.id === publicStoreId);
}

export function getPublicDemoStoreForProduct(
  product: ProductStoreReference,
): PublicDemoStore {
  const directlyMappedStore = publicStoreByInternalSlug.get(product.store_slug);
  if (directlyMappedStore) return directlyMappedStore;

  const numericId = Number(product.mock_product_id.match(/\d+/)?.[0] ?? 1);
  return publicStores[(Math.max(1, numericId) - 1) % publicStores.length];
}

export type StoreSlugClass = "active" | "synthetic" | "suspended" | "unknown";

/**
 * Classifies an internal store slug against the tracker + synthetic allowlist.
 * `active` and `synthetic` are publishable; `suspended` and `unknown` are not.
 */
export function classifyStoreSlug(slug: string): StoreSlugClass {
  if (publicStoreByInternalSlug.has(slug)) return "active";
  if (SYNTHETIC_STORE_SLUGS.has(slug)) return "synthetic";
  if (suspendedStoreSlugs.has(slug)) return "suspended";
  return "unknown";
}

/**
 * A product may render publicly only if its internal store slug is an active
 * tracked retailer or an approved synthetic demo source. Suspended and unknown
 * slugs are rejected here — the store list filter alone did not close this,
 * because unknown/suspended slugs still fell through to the numeric fallback.
 */
export function isPublishableStoreSlug(slug: string): boolean {
  const storeClass = classifyStoreSlug(slug);
  return storeClass === "active" || storeClass === "synthetic";
}

export function filterPublishableProducts<T extends ProductStoreReference>(
  products: T[],
): T[] {
  return products.filter((product) => {
    if (isPublishableStoreSlug(product.store_slug)) return true;
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[demo-stores] dropped ${product.mock_product_id}: store slug "${product.store_slug}" is ${classifyStoreSlug(product.store_slug)} (not publishable)`,
      );
    }
    return false;
  });
}

export function isPublicDemoStoreId(value: string): boolean {
  return publicStores.some((store) => store.id === value);
}

export function filterProductsByPublicDemoStore<T extends ProductStoreReference>(
  products: T[],
  publicStoreId?: string,
): T[] {
  if (!publicStoreId) return products;
  if (!isPublicDemoStoreId(publicStoreId)) return [];

  return products.filter(
    (product) => getPublicDemoStoreForProduct(product).id === publicStoreId,
  );
}
