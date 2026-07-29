import fs from "node:fs";
import path from "node:path";

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

const appRootCandidates = [
  process.cwd(),
  path.join(process.cwd(), "dist"),
];
const storeTrackerPath =
  appRootCandidates
    .map((root) => path.join(root, "data", "store_tracker.csv"))
    .find((candidate) => fs.existsSync(candidate)) ??
  path.join(appRootCandidates[0], "data", "store_tracker.csv");
const publicDemoStoreCount = 6;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
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

function getInternalStoreRecords(): InternalStoreRecord[] {
  const csv = fs.readFileSync(storeTrackerPath, "utf8").trim();
  const [headerLine, ...rows] = csv.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return rows
    .map((row) => {
      const values = parseCsvLine(row);
      const record = Object.fromEntries(
        headers.map((header, index) => [header, values[index] ?? ""]),
      );

      return {
        store_slug: record.store_slug,
        source_status: record.source_status,
      };
    })
    .filter(
      (store) =>
        store.store_slug &&
        store.source_status !== "market_suspended",
    )
    .sort((first, second) => first.store_slug.localeCompare(second.store_slug));
}

const internalStores = getInternalStoreRecords();

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
