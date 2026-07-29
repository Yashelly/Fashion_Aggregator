export type DemoStoreLocale = "lt" | "en";

export type PublicDemoStore = {
  id: string;
  label: {
    lt: string;
    en: string;
  };
};

type ProductStoreReference = {
  mock_product_id: string;
  store_slug: string;
};

const publicDemoStoreCount = 6;

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
  if (product.store_slug) {
    return publicStores[stableStoreIndex(product.store_slug)];
  }

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
