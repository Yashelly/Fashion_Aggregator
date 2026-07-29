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

  return rows
    .map((row) => {
      const values = parseCsvLine(row);
      return headers.reduce((product, header, index) => {
        product[header] = values[index] ?? "";
        return product;
      }, {} as MockProduct);
    })
    .filter((product) => product.source_status === "mock_not_live");
}

export function getStoreOptions(products: MockProduct[]) {
  const stores = new Map<string, string>();

  products.forEach((product) => {
    stores.set(product.store_slug, product.store_slug.replaceAll("_", " "));
  });

  return Array.from(stores.entries()).map(([value, label]) => ({
    value,
    label: label
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/\bVibewear\b/g, "VIBEWEAR")
      .replace(/\bLt\b/g, "LT"),
  }));
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function filterProducts(
  products: MockProduct[],
  params: {
    query?: string;
    store?: string;
    category?: string;
    color?: string;
    gender?: string;
    sale?: string;
    availability?: string;
    status?: string;
  },
) {
  const query = params.query?.trim() ? normalizeSearchText(params.query.trim()) : undefined;
  const priceUnder = query?.match(/\b(?:under|iki)\s+(\d+)\b/);
  const maxPrice = priceUnder ? Number(priceUnder[1]) : undefined;
  const status = params.status ?? "";
  const availability = params.availability || (status !== "sale" ? status : "");
  const saleOnly = params.sale === "on" || status === "sale";

  return products.filter((product) => {
    if (params.store && product.store_slug !== params.store) return false;
    if (params.category && product.category !== params.category) return false;
    if (params.color && product.color !== params.color) return false;
    if (saleOnly && !product.old_price_eur) return false;
    if (availability && product.availability !== availability) return false;
    if (params.gender && product.gender.toLowerCase() !== params.gender.toLowerCase()) {
      return false;
    }
    if (maxPrice && Number(product.price_eur) > maxPrice) return false;

    if (!query) return true;

    const synonymTerms: Record<string, string[]> = {
      aksesuarai: ["accessories"],
      avalyne: ["shoes"],
      balta: ["white"],
      baltas: ["white"],
      balti: ["white"],
      batai: ["shoes"],
      dzemperiai: ["hoodie", "hoodies", "sweats"],
      dzemperis: ["hoodie", "sweats"],
      ispardavimas: ["sale", "discount", "old_price"],
      juoda: ["black"],
      juodas: ["black"],
      juodi: ["black"],
      kelnes: ["trousers", "pants", "bottoms"],
      kojines: ["socks"],
      marskineliai: ["tshirt", "t-shirt", "tee", "top"],
      melyna: ["blue"],
      melynas: ["blue"],
      melyni: ["blue"],
      moterims: ["women"],
      moteriska: ["women"],
      moteriski: ["women"],
      nuolaida: ["sale", "discount", "old_price"],
      papuosalai: ["jewelry", "accessories"],
      rankine: ["bag", "bags", "shoulder_bag"],
      rankines: ["bag", "bags", "shoulder_bag"],
      raudona: ["red"],
      ruda: ["brown"],
      sportbaciai: ["sneakers", "trainers", "shoes"],
      sportbatis: ["sneakers", "trainers", "shoes"],
      striuke: ["jacket", "outerwear"],
      striukes: ["jacket", "outerwear"],
      suknele: ["dress", "dresses"],
      sukneles: ["dress", "dresses"],
      trainers: ["sneakers", "shoes"],
      sneaker: ["sneakers", "trainers"],
      sneakers: ["trainers", "shoes"],
      tee: ["tshirt", "t-shirt", "top"],
      "t-shirt": ["tshirt", "tee", "top"],
      tshirt: ["t-shirt", "tee", "top"],
      pants: ["trousers", "bottoms"],
      trousers: ["pants", "bottoms"],
      purse: ["bag", "shoulder_bag"],
      tote: ["bag", "shoulder_bag"],
      sale: ["discount", "old_price"],
      vyrams: ["men"],
      vyriska: ["men"],
      vyriski: ["men"],
      zalia: ["green"],
    };

    const queryTokens = query
      .replace(/\b(?:under|iki)\s+\d+\b/g, "")
      .split(/[\s,]+/)
      .map((token) => token.trim())
      .filter(Boolean);

    const haystack = [
      product.title,
      product.brand,
      product.category,
      product.subcategory,
      product.gender,
      product.color,
      product.style_tags,
      product.store_slug,
      product.old_price_eur ? "sale discount old_price" : "",
    ]
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

    return queryTokens.every((token) => {
      if (haystack.includes(token)) return true;
      return synonymTerms[token]?.some((term) => haystack.includes(term)) ?? false;
    });
  });
}

export function sortProducts(products: MockProduct[], sort?: string) {
  const sorted = [...products];

  if (sort === "price-low") {
    return sorted.sort((first, second) => Number(first.price_eur) - Number(second.price_eur));
  }

  if (sort === "price-high") {
    return sorted.sort((first, second) => Number(second.price_eur) - Number(first.price_eur));
  }

  if (sort === "sale") {
    return sorted.sort((first, second) => {
      const firstDiscount = first.old_price_eur
        ? Number(first.old_price_eur) - Number(first.price_eur)
        : 0;
      const secondDiscount = second.old_price_eur
        ? Number(second.old_price_eur) - Number(second.price_eur)
        : 0;

      return secondDiscount - firstDiscount;
    });
  }

  return sorted.sort((first, second) => {
    if (first.availability === second.availability) return 0;
    return first.availability === "in_stock" ? -1 : 1;
  });
}
