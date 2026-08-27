import path from "node:path";
import { readCsvFile } from "@/lib/csv";

/**
 * Visual attributes read off each product photo.
 *
 * The base catalog describes a product in about six words — title, category,
 * colour, three style tags. That is enough to answer "black boots" and nothing
 * about how a garment actually looks, which is why a query like "hoodie with a
 * geometric print" could not be answered at all: no field in
 * `data/mock_products.csv` records what is printed on the hoodie.
 *
 * `data/product_attributes.csv` fills that in. Every row was written by looking
 * at the product image in `public/demo-products/` and describing what is
 * visibly there — nothing inferred from the product name. Two rows say so
 * explicitly where the name and the photo disagree (MOCK-031 is called "Logo
 * Crew Socks" but carries no logo; MOCK-036 has no badge). Keep it that way:
 * the value of this file is that it reports the image, not the marketing.
 *
 * The catalog contains three geometric prints, one floral and one quilted
 * diamond. There are no star, stripe or animal motifs — so those queries
 * correctly return nothing rather than a near-miss.
 */
export type ProductAttributes = {
  /** What is depicted: "none", "geometric|abstract|…", "floral|…". */
  motif: string;
  /** How the surface reads: "satin|high_shine", "washed_denim|faded", … */
  surface: string;
  /** Construction features: "hood|drawstring|kangaroo_pocket", … */
  details: string;
  /** One sentence describing the piece as photographed. */
  visualDescription: string;
};

const attributesPath = path.join(process.cwd(), "data", "product_attributes.csv");

let cached: Map<string, ProductAttributes> | null = null;

/**
 * Attributes keyed by product id. The file is optional — without it search
 * simply falls back to the base catalog fields, which is exactly how the
 * product behaved before enrichment.
 */
export function getProductAttributes(): Map<string, ProductAttributes> {
  if (cached) return cached;

  const byProduct = new Map<string, ProductAttributes>();

  // The file is optional — `readCsvFile` returns [] when it is absent, and
  // search falls back to the base catalog fields, exactly how the product
  // behaved before enrichment.
  for (const record of readCsvFile<Record<string, string>>(attributesPath)) {
    if (!record.mock_product_id) continue;

    byProduct.set(record.mock_product_id, {
      motif: record.motif ?? "",
      surface: record.surface ?? "",
      details: record.details ?? "",
      visualDescription: record.visual_description ?? "",
    });
  }

  cached = byProduct;
  return byProduct;
}
