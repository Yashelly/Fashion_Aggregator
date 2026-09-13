import type { MockProduct } from "@/lib/mock-products";

export type PublicStoreLabel = Readonly<{
  en: string;
  lt: string;
}>;

export type PublicProduct = Readonly<{
  id: string;
  title: string;
  category: string;
  gender: string;
  color: string;
  sizeOptions: string[];
  priceEur: string;
  oldPriceEur: string;
  currency: string;
  availability: string;
  publicStoreId: string;
  storeLabel: PublicStoreLabel | null;
  imagePath: string;
  imageAvailable: boolean;
  detailImagePath: string;
  detailImageAvailable: boolean;
}>;

export type PublicRelatedProduct = Readonly<{
  id: string;
  title: string;
  category: string;
  priceEur: string;
  oldPriceEur: string;
  currency: string;
  imagePath: string | null;
  storeLabel: PublicStoreLabel | null;
}>;

const allowedSearchKeys = new Set([
  "availability",
  "category",
  "color",
  "gender",
  "lang",
  "minPrice",
  "maxPrice",
  "page",
  "perPage",
  "query",
  "sale",
  "sort",
  "status",
  "store",
]);

export function toPublicProduct(
  product: MockProduct,
  storeLabel: PublicStoreLabel | null,
): PublicProduct {
  return {
    id: product.mock_product_id,
    title: product.title,
    category: product.category,
    gender: product.gender,
    color: product.color,
    sizeOptions: product.size_options.split("|").filter(Boolean),
    priceEur: product.price_eur,
    oldPriceEur: product.old_price_eur,
    currency: product.currency,
    availability: product.availability,
    publicStoreId: product.public_store_id,
    storeLabel,
    imagePath: product.image_path,
    imageAvailable: product.image_available,
    detailImagePath: product.detail_image_path,
    detailImageAvailable: product.detail_image_available,
  };
}

export function toPublicRelatedProduct(
  product: MockProduct,
  storeLabel: PublicStoreLabel | null,
): PublicRelatedProduct {
  return {
    id: product.mock_product_id,
    title: product.title,
    category: product.category,
    priceEur: product.price_eur,
    oldPriceEur: product.old_price_eur,
    currency: product.currency,
    imagePath: product.image_available ? product.image_path : null,
    storeLabel,
  };
}

export function sanitizeSearchReturnTo(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || raw.length > 8192 || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/search";
  }

  try {
    const base = "https://weft.invalid";
    const url = new URL(raw, base);
    if (url.origin !== base || url.pathname !== "/search" || url.hash) return "/search";

    const safe = new URLSearchParams();
    for (const [key, queryValue] of url.searchParams) {
      if (allowedSearchKeys.has(key) && queryValue.length <= 500) {
        safe.set(key, queryValue);
      }
    }

    return `/search${safe.size ? `?${safe}` : ""}`;
  } catch {
    return "/search";
  }
}
