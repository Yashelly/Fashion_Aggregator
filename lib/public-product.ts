import type { MockProduct } from "@/lib/mock-products";
import { normalizeSearchValues, SEARCH_PARAM_KEYS, searchHref } from "@/lib/search-params";

const demoImagePattern = /^\/demo-products\/product-\d+(?:-tryon)?\.(?:png|webp)$/;

function sanitizeImageGallery(value: string[] | undefined): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const image of value ?? []) {
    if (!image || seen.has(image) || !demoImagePattern.test(image)) continue;
    seen.add(image);
    result.push(image);
  }

  return result;
}

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
  imageGallery: string[];
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

const allowedSearchKeys = new Set<string>([
  ...SEARCH_PARAM_KEYS,
  "availability",
  "gender",
  "stores",
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
  imageGallery: sanitizeImageGallery(product.image_gallery),
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

    const candidate: Record<string, string[]> = {};
    for (const [key, queryValue] of url.searchParams) {
      if (allowedSearchKeys.has(key) && queryValue.length <= 500) {
        (candidate[key] ??= []).push(queryValue);
      }
    }
    return searchHref(normalizeSearchValues(candidate));
  } catch {
    return "/search";
  }
}
