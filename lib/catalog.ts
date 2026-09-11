import "server-only";

import { assertUniqueBy } from "@/lib/csv";
import { isPublicDemoStoreId } from "@/lib/demo-stores";
import { getMockProducts, hasDemoProductImage, type MockProduct } from "@/lib/mock-products";
import { getProductAttributes } from "@/lib/product-attributes";
import { getSupabasePublicServerClient } from "@/lib/supabase-server";

type CatalogProductRow = {
  public_product_id: string;
  public_store_id: string;
  source_status: string;
  title: string;
  category: string;
  subcategory: string;
  brand: string;
  gender: string;
  color: string;
  size_options: string;
  price_eur: string;
  old_price_eur: string;
  currency: string;
  availability: string;
  style_tags: string;
  image_url: string;
  mock_url: string;
  notes: string;
};

const selectColumns = [
  "public_product_id", "public_store_id", "source_status", "title", "category",
  "subcategory", "brand", "gender", "color", "size_options", "price_eur",
  "old_price_eur", "currency", "availability", "style_tags", "image_url",
  "mock_url", "notes",
].join(",");
const successTtlMs = 60_000;
const failureRetryMs = 15_000;

let cached: { expiresAt: number; products: MockProduct[] } | null = null;
let inFlight: Promise<MockProduct[] | null> | null = null;
let retryAfter = 0;

function detailImagePath(imagePath: string) {
  return imagePath.replace(/\.(png|webp)$/i, "-tryon.$1");
}

function mapCatalogRows(rows: CatalogProductRow[]): MockProduct[] {
  const attributes = getProductAttributes();
  const products = rows
    .filter((row) => row.source_status === "mock_not_live")
    .map((row) => {
      if (!row.public_product_id || !row.title || !row.category) {
        throw new Error("Catalog row is missing a required public field");
      }
      if (!isPublicDemoStoreId(row.public_store_id)) {
        throw new Error("Catalog row references an unknown public demo store");
      }
      if (!Number.isFinite(Number(row.price_eur))) {
        throw new Error("Catalog row has a non-numeric price");
      }
      const imagePath = row.image_url || "";
      const detailPath = detailImagePath(imagePath);
      const visual = attributes.get(row.public_product_id);
      return {
        mock_product_id: row.public_product_id,
        store_slug: "vibewear_demo",
        source_status: row.source_status,
        title: row.title,
        category: row.category,
        subcategory: row.subcategory || "",
        brand: row.brand || "",
        gender: row.gender || "",
        color: row.color || "",
        size_options: row.size_options || "",
        price_eur: row.price_eur,
        old_price_eur: row.old_price_eur || "",
        currency: row.currency,
        availability: row.availability,
        style_tags: row.style_tags || "",
        image_url: imagePath,
        mock_url: `/out/${encodeURIComponent(row.public_product_id)}`,
        notes: row.notes || "",
        public_store_id: row.public_store_id,
        image_path: imagePath,
        image_available: hasDemoProductImage(imagePath),
        detail_image_path: detailPath,
        detail_image_available: hasDemoProductImage(detailPath),
        motif: visual?.motif ?? "",
        surface: visual?.surface ?? "",
        visual_details: visual?.details ?? "",
        visual_description: visual?.visualDescription ?? "",
      };
    });
  assertUniqueBy(products, "mock_product_id", "public catalog product id");
  return products;
}

async function fetchSupabaseCatalog(): Promise<MockProduct[] | null> {
  const client = getSupabasePublicServerClient();
  if (!client) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_500);
  try {
    const { data, error } = await client
      .from("catalog_products")
      .select(selectColumns)
      .order("public_product_id")
      .abortSignal(controller.signal);
    if (error || !data?.length) return null;
    return mapCatalogRows(data as unknown as CatalogProductRow[]);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Reads the least-privilege Supabase catalog when available. Until migration
 * 005 is applied and the demo seed is loaded, the bundled CSV remains a safe
 * availability fallback; failed remote reads are never cached as catalog data.
 */
export async function getCatalogProducts(): Promise<MockProduct[]> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.products;
  if (now < retryAfter) return getMockProducts();
  if (!inFlight) {
    inFlight = fetchSupabaseCatalog().finally(() => {
      inFlight = null;
    });
  }
  const products = await inFlight;
  if (!products) {
    retryAfter = Date.now() + failureRetryMs;
    return getMockProducts();
  }
  cached = { expiresAt: Date.now() + successTtlMs, products };
  retryAfter = 0;
  return products;
}
