import { sanitizeSearchReturnTo } from "@/lib/public-product";

export const SEARCH_CONTINUITY_STORAGE_KEY = "weft:search-continuity:v1";
export const SEARCH_CONTINUITY_VERSION = 1;
export const SEARCH_CONTINUITY_MAX_AGE_MS = 30 * 60 * 1000;

export type SearchContinuityPayload = Readonly<{
  version: typeof SEARCH_CONTINUITY_VERSION;
  searchHref: string;
  productId: string;
  scrollX: number;
  scrollY: number;
  focusTarget: string;
  capturedAt: number;
}>;

type ContinuityStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;
type ContinuityStorageSource = ContinuityStorage | (() => ContinuityStorage);

function resolveStorage(source: ContinuityStorageSource) {
  return typeof source === "function" ? source() : source;
}

function isPublicProductId(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= 160
    && /^[A-Za-z0-9._~-]+$/.test(value);
}

export function productLinkDomId(productId: string, kind: "media" | "title") {
  return `search-product-${productId}-${kind}`;
}

function isExpectedFocusTarget(productId: string, value: unknown): value is string {
  return value === productLinkDomId(productId, "media")
    || value === productLinkDomId(productId, "title");
}

function isScrollCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 10_000_000;
}

export function createSearchContinuityPayload(input: {
  searchHref: string;
  productId: string;
  scrollX: number;
  scrollY: number;
  focusTarget: string;
  capturedAt?: number;
}): SearchContinuityPayload | null {
  const searchHref = sanitizeSearchReturnTo(input.searchHref);
  if (searchHref !== input.searchHref
    || !isPublicProductId(input.productId)
    || !isExpectedFocusTarget(input.productId, input.focusTarget)
    || !isScrollCoordinate(input.scrollX)
    || !isScrollCoordinate(input.scrollY)) {
    return null;
  }

  const capturedAt = input.capturedAt ?? Date.now();
  if (!Number.isFinite(capturedAt) || capturedAt < 0) return null;

  return {
    version: SEARCH_CONTINUITY_VERSION,
    searchHref,
    productId: input.productId,
    scrollX: input.scrollX,
    scrollY: input.scrollY,
    focusTarget: input.focusTarget,
    capturedAt,
  };
}

export function parseSearchContinuityPayload(
  raw: string | null,
  currentSearchHref: string,
  now = Date.now(),
): SearchContinuityPayload | null {
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const candidate = value as Partial<SearchContinuityPayload>;
    if (candidate.version !== SEARCH_CONTINUITY_VERSION
      || typeof candidate.searchHref !== "string"
      || sanitizeSearchReturnTo(candidate.searchHref) !== candidate.searchHref
      || sanitizeSearchReturnTo(currentSearchHref) !== candidate.searchHref
      || !isPublicProductId(candidate.productId)
      || !isExpectedFocusTarget(candidate.productId, candidate.focusTarget)
      || !isScrollCoordinate(candidate.scrollX)
      || !isScrollCoordinate(candidate.scrollY)
      || typeof candidate.capturedAt !== "number"
      || !Number.isFinite(candidate.capturedAt)
      || candidate.capturedAt > now + 5_000
      || now - candidate.capturedAt > SEARCH_CONTINUITY_MAX_AGE_MS) {
      return null;
    }
    return candidate as SearchContinuityPayload;
  } catch {
    return null;
  }
}

export function saveSearchContinuityPayload(
  storageSource: ContinuityStorageSource,
  payload: SearchContinuityPayload,
) {
  try {
    const storage = resolveStorage(storageSource);
    storage.setItem(SEARCH_CONTINUITY_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function consumeSearchContinuityPayload(
  storageSource: ContinuityStorageSource,
  currentSearchHref: string,
  now = Date.now(),
) {
  let raw: string | null;
  try {
    const storage = resolveStorage(storageSource);
    raw = storage.getItem(SEARCH_CONTINUITY_STORAGE_KEY);
    if (raw !== null) storage.removeItem(SEARCH_CONTINUITY_STORAGE_KEY);
  } catch {
    return null;
  }
  return parseSearchContinuityPayload(raw, currentSearchHref, now);
}
