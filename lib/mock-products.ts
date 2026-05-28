import fs from "node:fs";
import path from "node:path";

export type MockProduct = {
  mock_product_id: string;
  store_slug: string;
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

const csvPath = path.join(process.cwd(), "data", "mock_products.csv");

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

export function getMockProducts(): MockProduct[] {
  const csv = fs.readFileSync(csvPath, "utf8").trim();
  const [headerLine, ...rows] = csv.split(/\r?\n/);
  const headers = parseCsvLine(headerLine) as Array<keyof MockProduct>;

  return rows.map((row) => {
    const values = parseCsvLine(row);
    return headers.reduce((product, header, index) => {
      product[header] = values[index] ?? "";
      return product;
    }, {} as MockProduct);
  });
}

export function getStoreOptions(products: MockProduct[]) {
  const stores = new Map<string, string>();

  products.forEach((product) => {
    stores.set(product.store_slug, product.store_slug.replaceAll("_", " "));
  });

  return Array.from(stores.entries()).map(([value, label]) => ({
    value,
    label: label.replace(/\b\w/g, (char) => char.toUpperCase()),
  }));
}

export function filterProducts(
  products: MockProduct[],
  params: {
    query?: string;
    store?: string;
    category?: string;
    color?: string;
  },
) {
  const query = params.query?.trim().toLowerCase();

  return products.filter((product) => {
    if (params.store && product.store_slug !== params.store) return false;
    if (params.category && product.category !== params.category) return false;
    if (params.color && product.color !== params.color) return false;

    if (!query) return true;

    const haystack = [
      product.title,
      product.brand,
      product.category,
      product.subcategory,
      product.gender,
      product.color,
      product.style_tags,
      product.store_slug,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

