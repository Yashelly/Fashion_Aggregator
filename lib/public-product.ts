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
  description?: string;
  material?: string;
  surface?: string;
  constructionDetails?: string;
  sizeSystem?: string;
  garmentMeasurements?: Record<string, string>;
  measurementSource?: string;
  fitNote?: string;
  factProvenance?: "controlled_synthetic" | "retailer_verified";
  sizeAvailability?: Record<string, "in_stock" | "limited" | "out_of_stock" | "unknown">;
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
  const gallery = sanitizeImageGallery([
    ...(product.image_gallery ?? []),
    product.image_path,
    product.detail_image_path,
  ]);
  const imagePath = gallery[0] ?? "";
  const detailImagePath = gallery[1] ?? "";
  const optional = {
    ...(product.description ? { description: product.description } : {}),
    ...(product.material ? { material: product.material } : {}),
    ...(product.surface ? { surface: product.surface } : {}),
    ...(product.construction_details ? { constructionDetails: product.construction_details } : {}),
    ...(product.size_system ? { sizeSystem: product.size_system } : {}),
    ...(product.garment_measurements ? { garmentMeasurements: product.garment_measurements } : {}),
    ...(product.measurement_source ? { measurementSource: product.measurement_source } : {}),
    ...(product.fit_note ? { fitNote: product.fit_note } : {}),
    ...(product.fact_provenance ? { factProvenance: product.fact_provenance } : {}),
    ...(product.size_availability ? { sizeAvailability: product.size_availability } : {}),
  };
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
    imagePath,
    imageAvailable: Boolean(imagePath),
    detailImagePath,
    detailImageAvailable: Boolean(detailImagePath),
    imageGallery: gallery,
    ...optional,
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
