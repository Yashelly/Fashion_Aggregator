import crypto from "node:crypto";
import type { MockProduct, SearchFilterParams } from "@/lib/mock-products";

/** Input data is part of identity: budget/store scopes must never share results. */
export function createSearchCacheKey(products: MockProduct[], params: SearchFilterParams) {
  const normalized = {
    availability: params.availability ?? "", category: params.category ?? "", color: params.color ?? "",
    gender: params.gender ?? "", query: params.query?.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("lt") ?? "",
    sale: params.sale ?? "", status: params.status ?? "", store: params.store ?? "",
  };
  return crypto.createHash("sha256").update(JSON.stringify([normalized, products])).digest("hex");
}
