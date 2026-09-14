import crypto from "node:crypto";
import type { MockProduct, SearchFilterParams } from "@/lib/mock-products";

/** Input data is part of identity: budget/store scopes must never share results. */
export function createSearchCacheKey(products: MockProduct[], params: SearchFilterParams) {
  const multiValue = (value: string | undefined) => Array.from(new Set(
    value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [],
  )).sort().join(",");
  const normalized = {
    availability: params.availability ?? "", category: params.category ?? "", color: multiValue(params.color),
    department: params.department ?? params.gender ?? "", maxPrice: params.maxPrice ?? "", minPrice: params.minPrice ?? "",
    query: params.query?.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("lt") ?? "",
    sale: params.sale ?? "", size: multiValue(params.size), status: params.status ?? "", store: multiValue(params.store),
  };
  return crypto.createHash("sha256").update(JSON.stringify([normalized, products])).digest("hex");
}
