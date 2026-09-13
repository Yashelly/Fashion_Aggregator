import type { MockProduct } from "@/lib/mock-products";

export type SearchValues = Record<string, string | undefined>;
const keys = ["query", "category", "gender", "color", "store", "status", "sort", "minPrice", "maxPrice", "page", "perPage", "lang"] as const;
export const FILTER_KEYS = ["category", "gender", "color", "store", "status", "minPrice", "maxPrice"] as const;
export const MAX_QUERY_LENGTH = 500;

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

/** Legacy aliases are consumed once, never silently combined with canonical status. */
export function normalizeSearchValues(input: Record<string, string | string[] | undefined>): SearchValues {
  const first = (key: string) => { const v = input[key]; return (Array.isArray(v) ? v[0] : v)?.trim() || undefined; };
  const values: SearchValues = {};
  for (const key of keys) { const value = first(key); if (value) values[key] = value; }
  if (!values.store && input.stores) values.store = (Array.isArray(input.stores) ? input.stores : [input.stores]).join(",");
  if (!("status" in input)) values.status = first("sale") === "on" ? "sale" : first("availability");
  if (values.store) values.store = Array.from(new Set(values.store.split(",").map((s) => s.trim()).filter(Boolean))).sort().join(",");
  for (const key of ["minPrice", "maxPrice"]) {
    const price = parsePrice(values[key]);
    if (price !== undefined && Number.isFinite(price)) values[key] = String(price);
  }
  if (!["price-low", "price-high", "sale", "available"].includes(values.sort ?? "")) delete values.sort;
  if (!["20", "50", "100"].includes(values.perPage ?? "")) delete values.perPage;
  if (!/^[1-9]\d{0,5}$/.test(values.page ?? "")) delete values.page;
  if (values.lang !== "lt") delete values.lang;
  return values;
}

export function searchHref(params: SearchValues, updates: SearchValues = {}) {
  const values = { ...params, ...updates };
  const query = new URLSearchParams();
  for (const key of keys) if (values[key]) query.set(key, values[key]!);
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
  return products.filter((product) => {
    const price = Number(product.price_eur);
    return (!stores.length || stores.includes(product.public_store_id))
      && (min === undefined || (Number.isFinite(price) && price >= min))
      && (max === undefined || (Number.isFinite(price) && price <= max));
  });
}
