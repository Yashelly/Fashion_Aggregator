import fs from "node:fs";
import path from "node:path";
import { assertUniqueBy, parseCsvRecords } from "@/lib/csv";
import {
  filterPublishableProducts,
  getPublicDemoStoreForProduct,
  getPublicDemoStores,
  type DemoStoreLocale,
} from "@/lib/demo-stores";
import { getProductAttributes, type ProductAttributes } from "@/lib/product-attributes";
import { interpretQuery, semanticSearch, type QueryInterpretation } from "@/lib/semantic-search";

type CsvMockProduct = {
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

export type MockProduct = CsvMockProduct & {
  public_store_id: string;
  image_path: string;
  image_available: boolean;
  detail_image_path: string;
  detail_image_available: boolean;
  image_gallery: string[];
  /** Optional facts are populated only when a controlled source supplies them. */
  description?: string;
  material?: string;
  construction_details?: string;
  size_system?: string;
  garment_measurements?: Record<string, string>;
  measurement_source?: string;
  fit_note?: string;
  fact_provenance?: ProductFactProvenance;
  size_availability?: Record<string, ProductAvailability>;
  /** Visual attributes read off the product photo; empty when unenriched. */
  motif: string;
  surface: string;
  visual_details: string;
  visual_description: string;
};

export type ProductFactProvenance = "controlled_synthetic" | "retailer_verified";
export type ProductAvailability = "in_stock" | "limited" | "out_of_stock" | "unknown";

const csvPath = path.join(process.cwd(), "data", "mock_products.csv");
const demoProductDirectory = path.join(process.cwd(), "public", "demo-products");

let productCache: { mtimeMs: number; products: MockProduct[] } | null = null;
const imageExtensionPattern = /^\/demo-products\/product-\d+(?:-tryon)?\.(?:png|webp)$/;

export function splitImagePaths(raw: string | undefined): string[] {
  return (raw ?? "").split("|").map((path) => path.trim()).filter(Boolean);
}

/**
 * Keep the demo image boundary in one place. Feed values may contain a
 * pipe-delimited collection; source order is meaningful, duplicates are not.
 */
export function normalizeDemoImageGallery(paths: Iterable<string>, checkExists = true): string[] {
  const seen = new Set<string>();
  const images: string[] = [];

  for (const rawPath of paths) {
    const imagePath = rawPath.trim();
    if (!imagePath || seen.has(imagePath)) continue;
    if (!imageExtensionPattern.test(imagePath)) continue;
    if (checkExists && !hasDemoProductImage(imagePath)) continue;

    seen.add(imagePath);
    images.push(imagePath);
  }

  return images;
}

export function detailImagePath(imagePath: string): string {
  return imagePath.replace(/\.(png|webp)$/i, "-tryon.$1");
}

function inferSizeSystem(sizeOptions: string): string | undefined {
  const sizes = splitImagePaths(sizeOptions);
  if (sizes.length === 0) return undefined;
  if (sizes.every((size) => size.toLowerCase() === "one_size")) return "One size";
  if (sizes.every((size) => /^(?:xxs|xs|s|m|l|xl|xxl)$/i.test(size))) return "Lettered";
  if (sizes.every((size) => /^\d+(?:-\d+)?$/.test(size))) return "Numeric";
  return undefined;
}

const materialPatterns: Array<[RegExp, string]> = [
  [/cashmere-feel wool/i, "cashmere-feel wool"],
  [/linen-blend/i, "linen blend"],
  [/wool-blend/i, "wool blend"],
  [/faux[- ]leather/i, "faux leather"],
  [/smooth leather|grained leather|leather upper/i, "leather"],
  [/brushed fleece/i, "fleece"],
  [/brushed wool|soft wool|wool melton|wool flannel/i, "wool"],
  [/washed cotton|heavy cotton|cotton jersey|cotton twill|cotton canvas/i, "cotton"],
  [/slubbed linen/i, "linen"],
  [/viscose/i, "viscose"],
  [/nylon/i, "nylon"],
  [/denim/i, "denim"],
  [/satin/i, "satin"],
  [/velvet/i, "velvet"],
  [/mesh/i, "mesh"],
  [/suede/i, "suede"],
  [/jersey/i, "jersey"],
  [/canvas/i, "canvas"],
];

/** Extract only materials explicitly stated in the controlled visual description. */
export function extractControlledMaterial(description: string): string | undefined {
  for (const [pattern, material] of materialPatterns) {
    if (pattern.test(description)) return material;
  }
  return undefined;
}

function inferFitNote(details: string): string | undefined {
  const values = new Set(splitImagePaths(details));
  const fit = [
    ["oversized", "Oversized"],
    ["boxy_fit", "Boxy"],
    ["tailored_fit", "Tailored"],
    ["regular_fit", "Regular fit"],
    ["fitted", "Fitted"],
    ["relaxed", "Relaxed"],
  ] as const;
  return fit.find(([tag]) => values.has(tag))?.[1];
}

function controlledFacts(
  visual: ProductAttributes | undefined,
  sizeOptions: string,
) {
  const description = visual?.visualDescription?.trim() || undefined;
  const surface = visual?.surface?.trim() || undefined;
  const construction = visual?.details?.trim() || undefined;
  const material = description ? extractControlledMaterial(description) : undefined;
  const sizeSystem = inferSizeSystem(sizeOptions);
  const fitNote = construction ? inferFitNote(construction) : undefined;
  const sizeAvailability = sizeOptions
    ? Object.fromEntries(splitImagePaths(sizeOptions).map((size) => [size, "unknown" as const]))
    : undefined;
  const hasFacts = Boolean(description || material || surface || construction || sizeSystem || fitNote);

  return {
    description,
    material,
    construction_details: construction,
    surface,
    size_system: sizeSystem,
    fit_note: fitNote,
    fact_provenance: hasFacts ? "controlled_synthetic" as const : undefined,
    size_availability: sizeAvailability,
  };
}

export function getMockProducts(): MockProduct[] {
  // The synthetic catalog is a static, committed file, but this function is
  // called on every request and does real work: read + parse the CSV and run
  // ~130 fs.existsSync image probes. Memoise the result on the CSV's mtime — the
  // hot path becomes a single stat, and the cache auto-invalidates if the file
  // is edited (so `npm run dev` stays live). Determinism is unaffected: the
  // output is a pure function of the file's bytes, and callers treat the array
  // as read-only (filter/sort both copy before mutating).
  const { mtimeMs } = fs.statSync(csvPath);
  if (productCache && productCache.mtimeMs === mtimeMs) return productCache.products;

  const rawRecords = parseCsvRecords<CsvMockProduct>(fs.readFileSync(csvPath, "utf8"));

  // Catalog integrity: a duplicate product id makes every id lookup ambiguous
  // (`/out/:id`, click analytics, listings join), so reject it loudly at load
  // rather than serve a silently wrong row.
  assertUniqueBy(rawRecords, "mock_product_id", "product id");

  const attributes = getProductAttributes();

  const products = rawRecords
    .map((csvProduct, index) => {
      const fallbackImagePath = `/demo-products/product-${String(index + 1).padStart(2, "0")}.webp`;
      const sourceImagePaths = splitImagePaths(csvProduct.image_url);
      const hasSourceImage = sourceImagePaths.some((imagePath) => hasDemoProductImage(imagePath));
      const baseImagePaths = hasSourceImage ? sourceImagePaths : [fallbackImagePath];
      const imageGallery = normalizeDemoImageGallery([
        ...baseImagePaths,
        detailImagePath(baseImagePaths[0] ?? fallbackImagePath),
      ]);
      const imagePath = imageGallery[0] ?? "";
      const detailPath = imageGallery[1] ?? "";

      const visual = attributes.get(csvProduct.mock_product_id);
      const facts = controlledFacts(visual, csvProduct.size_options);

      return {
        ...csvProduct,
        image_url: imagePath,
        image_path: imagePath,
        image_available: Boolean(imagePath),
        detail_image_path: detailPath,
        detail_image_available: Boolean(detailPath),
        image_gallery: imageGallery,
        ...facts,
        public_store_id: getPublicDemoStoreForProduct(csvProduct).id,
        motif: visual?.motif ?? "",
        surface: visual?.surface ?? "",
        visual_details: visual?.details ?? "",
        visual_description: visual?.visualDescription ?? "",
      };
    })
    .filter((product) => product.source_status === "mock_not_live");

  // Price integrity: sort/compare/format all treat price_eur as a number, so a
  // blank or non-numeric price would surface as NaN in the UI. Reject it at load
  // with the offending id rather than render a broken price.
  for (const product of products) {
    if (!Number.isFinite(Number(product.price_eur))) {
      throw new Error(
        `[mock-products] ${product.mock_product_id} has a non-numeric price_eur: "${product.price_eur}"`,
      );
    }
  }

  // Reject products attached to suspended or unknown internal stores. Only
  // active retailers and approved synthetic sources may render publicly; without
  // this a suspended slug would silently fall through to a neutral demo store.
  const publishable = filterPublishableProducts(products);

  productCache = { mtimeMs, products: publishable };
  return publishable;
}

export function getStoreOptions(
  products: MockProduct[],
  locale: DemoStoreLocale = "en",
) {
  const populatedStoreIds = new Set(products.map((product) => product.public_store_id));

  return getPublicDemoStores()
    .filter((store) => populatedStoreIds.has(store.id))
    .map((store) => ({
      value: store.id,
      label: store.label[locale],
      labels: store.label,
    }));
}

function matchesCategory(product: MockProduct, category: string) {
  // Jeans is a garment facet, not the broader denim material or a search term.
  return category === "jeans"
    ? product.category === "bottoms" && product.subcategory === "jeans"
    : product.category === category;
}

export function getCategoryOptions(products: MockProduct[]) {
  const categories = new Set(products.map((product) => product.category).filter(Boolean));
  if (products.some((product) => matchesCategory(product, "jeans"))) categories.add("jeans");
  return [...categories].sort();
}

export function hasDemoProductImage(imagePath: string): boolean {
  if (!/^\/demo-products\/product-\d+(?:-tryon)?\.(?:png|webp)$/.test(imagePath)) return false;
  return fs.existsSync(path.join(demoProductDirectory, path.basename(imagePath)));
}

export type SearchFilterParams = {
  query?: string;
  store?: string;
  category?: string;
  color?: string;
  size?: string;
  department?: string;
  /** Temporary input compatibility; canonical URLs use `department`. */
  gender?: string;
  sale?: string;
  availability?: string;
  status?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
};

function splitSelectedValues(value: string | undefined): string[] {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

/** Product-level `size_options` are listed choices, not inferred body-size coverage. */
export function getSizeOptions(products: MockProduct[]) {
  return Array.from(new Set(
    products.flatMap((product) => product.size_options.split("|").map((size) => size.trim()).filter(Boolean)),
  )).sort((first, second) => first.localeCompare(second, undefined, { numeric: true }));
}

function finitePrice(value: number | string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const price = typeof value === "number" ? value : Number(value.replace(",", "."));
  return Number.isFinite(price) ? price : NaN;
}

/**
 * Structural filters only — the facets the shopper picked explicitly.
 *
 * Free-text relevance is handled separately by `searchProducts` so that a query
 * ranks results instead of narrowing them; see `lib/semantic-search.ts` for why
 * the old token-AND matcher was replaced.
 */
export function filterProducts(
  products: MockProduct[],
  params: SearchFilterParams,
) {
  const minPrice = finitePrice(params.minPrice);
  const maxPrice = finitePrice(params.maxPrice);
  const status = params.status ?? "";
  const availability = params.availability || (status !== "sale" ? status : "");
  const saleOnly = params.sale === "on" || status === "sale";
  const stores = splitSelectedValues(params.store);
  const colors = splitSelectedValues(params.color);
  const sizes = splitSelectedValues(params.size).map((size) => size.toLocaleLowerCase());
  const department = params.department ?? params.gender;

  return products.filter((product) => {
    if (stores.length > 0 && !stores.includes(product.public_store_id)) return false;
    if (params.category && !matchesCategory(product, params.category)) return false;
    if (colors.length > 0 && !colors.includes(product.color)) return false;
    if (sizes.length > 0 && !product.size_options.split("|").some((size) => sizes.includes(size.trim().toLocaleLowerCase()))) return false;
    if (saleOnly && !product.old_price_eur) return false;
    if (availability ? product.availability !== availability : product.availability === "out_of_stock") return false;
    if (department && product.gender.toLowerCase() !== department.toLowerCase()) {
      return false;
    }
    if (minPrice !== undefined && (!Number.isFinite(minPrice) || Number(product.price_eur) < minPrice)) return false;
    if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || Number(product.price_eur) > maxPrice)) return false;

    return true;
  });
}

export type ProductSearchResult = {
  results: MockProduct[];
  /** Relevance by product id — empty when no free-text query was given. */
  relevance: Map<string, number>;
  interpretation: QueryInterpretation | null;
  /** True only when exact matching was empty and explicitly-labelled near-misses are shown. */
  approximate: boolean;
  /** Constraints softened for the approximate result set. */
  relaxedConstraints: string[];
};

/**
 * Apply the shopper's facets, then rank whatever survives against their query.
 * The two stages stay separate on purpose: a facet is a promise ("only show me
 * black"), a query is a description ("something warm"), and only the second one
 * should be allowed to reorder rather than exclude.
 */
export function searchProducts(
  products: MockProduct[],
  params: SearchFilterParams,
): ProductSearchResult {
  const rawQuery = params.query?.trim();

  if (!rawQuery) {
    return {
      results: filterProducts(products, params),
      relevance: new Map(),
      interpretation: null,
      approximate: false,
      relaxedConstraints: [],
    };
  }

  const interpretation = interpretQuery(rawQuery);
  const explicitMinPrice = finitePrice(params.minPrice);
  const explicitMaxPrice = finitePrice(params.maxPrice);
  const minPrice = explicitMinPrice !== undefined && !Number.isFinite(explicitMinPrice)
    ? NaN
    : interpretation.minPrice === undefined
      ? explicitMinPrice
      : Math.max(explicitMinPrice ?? -Infinity, interpretation.minPrice);
  const maxPrice = explicitMaxPrice !== undefined && !Number.isFinite(explicitMaxPrice)
    ? NaN
    : interpretation.maxPrice === undefined
      ? explicitMaxPrice
      : Math.min(explicitMaxPrice ?? Infinity, interpretation.maxPrice);
  const faceted = filterProducts(products, {
    ...params,
    minPrice,
    maxPrice,
  });
  const { matches, alternatives, relaxedConstraints } = semanticSearch(faceted, rawQuery);
  const selected = matches.length > 0 ? matches : alternatives;

  return {
    results: selected.map((match) => match.product),
    relevance: new Map(selected.map((match) => [match.product.mock_product_id, match.score])),
    interpretation,
    approximate: matches.length === 0 && alternatives.length > 0,
    relaxedConstraints,
  };
}


/**
 * `relevance` is supplied when the shopper typed a query. With no explicit sort
 * chosen, relevance wins over the availability default — a shopper who
 * described what they wanted has already told us how to order the page.
 */
export function sortProducts(
  products: MockProduct[],
  sort?: string,
  relevance?: Map<string, number>,
) {
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

  if (relevance && relevance.size > 0) {
    return sorted.sort(
      (first, second) =>
        (relevance.get(second.mock_product_id) ?? 0) - (relevance.get(first.mock_product_id) ?? 0),
    );
  }

  return sorted.sort((first, second) => {
    if (first.availability === second.availability) return 0;
    return first.availability === "in_stock" ? -1 : 1;
  });
}
