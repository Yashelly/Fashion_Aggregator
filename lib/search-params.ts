import type { MockProduct } from "@/lib/mock-products";

export type SearchValues = Record<string, string | undefined>;
export const SEARCH_PARAM_KEYS = ["query", "category", "department", "color", "size", "store", "status", "sale", "sort", "minPrice", "maxPrice", "page", "perPage", "lang"] as const;
export const FILTER_KEYS = ["category", "department", "color", "size", "store", "status", "sale", "minPrice", "maxPrice"] as const;
export const MAX_QUERY_LENGTH = 500;

const MULTI_VALUE_KEYS = ["color", "size", "store"] as const;
const SEARCH_INPUT_KEYS = new Set<string>([...SEARCH_PARAM_KEYS, "availability", "gender", "stores"]);

function normalizeMultiValue(values: readonly string[]): string | undefined {
  const normalized = Array.from(new Set(
    values.flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean),
  )).sort((first, second) => first.localeCompare(second));
  return normalized.length > 0 ? normalized.join(",") : undefined;
}

export function parsePrice(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  if (!/^\d{1,6}(?:[.,]\d{1,2})?$/.test(value.trim())) return NaN;
  return Number(value.trim().replace(",", "."));
}

export function validPriceRange(min: string | undefined, max: string | undefined) {
  const low = parsePrice(min), high = parsePrice(max);
  return (low === undefined || Number.isFinite(low)) && (high === undefined || Number.isFinite(high))
    && (low === undefined || high === undefined || low <= high);
}

/** Legacy aliases are consumed once; emitted URLs use only canonical keys. */
export function normalizeSearchValues(input: Record<string, string | string[] | undefined>): SearchValues {
  const first = (key: string) => { const v = input[key]; return (Array.isArray(v) ? v[0] : v)?.trim() || undefined; };
  const values: SearchValues = {};
  for (const key of SEARCH_PARAM_KEYS) { const value = first(key); if (value) values[key] = value; }
  if (!values.department) {
    const legacyDepartment = first("gender");
    if (legacyDepartment) values.department = legacyDepartment;
  }
  if (!values.store && input.stores) values.store = normalizeMultiValue(Array.isArray(input.stores) ? input.stores : [input.stores]);
  if (!("status" in input)) {
    const legacyStatus = first("availability");
    if (legacyStatus) values.status = legacyStatus;
  }
  if (values.status === "sale") {
    delete values.status;
    if (!("sale" in input)) values.sale = "on";
  }
  if (values.sale !== "on") delete values.sale;
  for (const key of MULTI_VALUE_KEYS) {
    const raw = input[key] ?? values[key];
    const normalized = normalizeMultiValue(raw === undefined ? [] : Array.isArray(raw) ? raw : [raw]);
    if (normalized) values[key] = normalized;
    else delete values[key];
  }
  for (const key of ["minPrice", "maxPrice"]) {
    const price = parsePrice(values[key]);
    if (price !== undefined && Number.isFinite(price)) values[key] = String(price);
  }
  if (!["price-low", "price-high", "sale", "available"].includes(values.sort ?? "")) delete values.sort;
  if (!["20", "50", "100"].includes(values.perPage ?? "")) delete values.perPage;
  if (!/^[1-9]\d{0,5}$/.test(values.page ?? "") || values.page === "1") delete values.page;
  if (values.lang !== "lt") delete values.lang;
  return values;
}

export function searchHref(params: SearchValues, updates: SearchValues = {}) {
  const values = normalizeSearchValues({ ...params, ...updates });
  const query = new URLSearchParams();
  for (const key of SEARCH_PARAM_KEYS) if (values[key]) query.set(key, values[key]!);
  return `/search${query.size ? `?${query}` : ""}`;
}

export function clearFilterValues(params: SearchValues) {
  const next = { ...params };
  for (const key of FILTER_KEYS) delete next[key];
  delete next.page;
  return next;
}

/** Explicit shopper limits stay hard even when semantic search offers alternatives. */
export function scopeSearchProducts(products: MockProduct[], params: SearchValues) {
  if (!validPriceRange(params.minPrice, params.maxPrice)) return [];
  const min = parsePrice(params.minPrice), max = parsePrice(params.maxPrice);
  const stores = params.store?.split(",").filter(Boolean) ?? [];
  const colors = params.color?.split(",").filter(Boolean) ?? [];
  const sizes = params.size?.split(",").filter(Boolean).map((size) => size.toLocaleLowerCase()) ?? [];
  return products.filter((product) => {
    const price = Number(product.price_eur);
    return (!stores.length || stores.includes(product.public_store_id))
      && (!colors.length || colors.includes(product.color))
      && (!sizes.length || (product.size_options ?? "").split("|").some((size) => sizes.includes(size.trim().toLocaleLowerCase())))
      && (!params.category || (params.category === "jeans"
        ? product.category === "bottoms" && product.subcategory === "jeans"
        : product.category === params.category))
      && (!params.department || (product.gender ?? "").toLocaleLowerCase() === params.department.toLocaleLowerCase())
      && (!params.status
        ? product.availability !== "out_of_stock"
        : product.availability === params.status)
      && (params.sale !== "on" || Boolean(product.old_price_eur))
      && (min === undefined || (Number.isFinite(price) && price >= min))
      && (max === undefined || (Number.isFinite(price) && price <= max));
  });
}

/** Parse and canonicalize a same-origin search URL using the normalizer used by server rendering. */
export function canonicalizeSearchHref(value: unknown): string | null {
  if (typeof value !== "string" || !value || value.length > 8192 || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const base = "https://weft.invalid";
    const parsed = new URL(value, base);
    if (parsed.origin !== base || parsed.pathname !== "/search" || parsed.hash) return null;

    const candidate: Record<string, string[]> = {};
    for (const [key, entryValue] of parsed.searchParams) {
      if (SEARCH_INPUT_KEYS.has(key) && entryValue.length <= 500) {
        (candidate[key] ??= []).push(entryValue);
      }
    }
    return searchHref(normalizeSearchValues(candidate));
  } catch {
    return null;
  }
}
