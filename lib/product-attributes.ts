import fs from "node:fs";
import path from "node:path";

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

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
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

let cached: Map<string, ProductAttributes> | null = null;

/**
 * Attributes keyed by product id. The file is optional — without it search
 * simply falls back to the base catalog fields, which is exactly how the
 * product behaved before enrichment.
 */
export function getProductAttributes(): Map<string, ProductAttributes> {
  if (cached) return cached;

  const byProduct = new Map<string, ProductAttributes>();

  if (!fs.existsSync(attributesPath)) {
    cached = byProduct;
    return byProduct;
  }

  const csv = fs.readFileSync(attributesPath, "utf8").trim();
  const [headerLine, ...rows] = csv.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  for (const row of rows) {
    const values = parseCsvLine(row);
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
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
