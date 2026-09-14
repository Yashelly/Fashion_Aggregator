/** Browser-local recent search history. No search data leaves this module. */

import { canonicalizeSearchHref } from "@/lib/search-params";

export const RECENT_SEARCHES_STORAGE_KEY = "weft-recent-searches";
export const RECENT_SEARCH_VERSION = 1;
export const MAX_RECENT_SEARCHES = 8;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type RecentSearch = Readonly<{
  version: typeof RECENT_SEARCH_VERSION;
  url: string;
  label: string;
  timestamp: number;
}>;

export type RecentSearchInput = Readonly<{
  url: string;
  label: string;
  timestamp?: number;
}>;

function validTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function browserStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function cleanLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const label = value.trim().replace(/\s+/g, " ").slice(0, 160);
  return label || null;
}

export function canonicalizeRecentSearchUrl(value: unknown): string | null {
  return canonicalizeSearchHref(value);
}

function normalizeEntry(value: unknown): RecentSearch | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;

  if (typeof candidate.query === "string") {
    const label = cleanLabel(candidate.query);
    if (!label) return null;
    const url = canonicalizeRecentSearchUrl(`/search?query=${encodeURIComponent(label)}`);
    if (!url) return null;
    return {
      version: RECENT_SEARCH_VERSION,
      url,
      label,
      timestamp: validTimestamp(candidate.at) ? candidate.at : 0,
    };
  }

  const url = canonicalizeRecentSearchUrl(candidate.url);
  const label = cleanLabel(candidate.label);
  if (!url || !label) return null;
  return {
    version: RECENT_SEARCH_VERSION,
    url,
    label,
    timestamp: validTimestamp(candidate.timestamp) ? candidate.timestamp : 0,
  };
}

function normalizeEntries(value: unknown): RecentSearch[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const entries: RecentSearch[] = [];
  for (const valueEntry of value) {
    const entry = normalizeEntry(valueEntry);
    if (!entry || seen.has(entry.url)) continue;
    seen.add(entry.url);
    entries.push(entry);
    if (entries.length === MAX_RECENT_SEARCHES) break;
  }
  return entries;
}

export function createRecentSearchStore(getStorage: () => StorageLike | null = browserStorage) {
  let memoryEntries: RecentSearch[] = [];
  let storageUnavailable = false;

  function read(): RecentSearch[] {
    if (storageUnavailable) return [...memoryEntries];
    try {
      const storage = getStorage();
      if (!storage) throw new Error("Storage unavailable");
      const raw = storage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      let parsed: unknown = [];
      if (raw) {
        try {
          parsed = JSON.parse(raw);
        } catch {
          storage.setItem(RECENT_SEARCHES_STORAGE_KEY, "[]");
        }
      }
      const entries = normalizeEntries(parsed);
      memoryEntries = entries;
      if (raw && JSON.stringify(parsed) !== JSON.stringify(entries)) {
        storage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(entries));
      }
      return [...entries];
    } catch {
      storageUnavailable = true;
      return [...memoryEntries];
    }
  }

  function record(input: RecentSearchInput): RecentSearch[] {
    const url = canonicalizeRecentSearchUrl(input.url);
    const label = cleanLabel(input.label);
    if (!url || !label) return read();
    const entry: RecentSearch = {
      version: RECENT_SEARCH_VERSION,
      url,
      label,
      timestamp: validTimestamp(input.timestamp) ? input.timestamp : Date.now(),
    };
    const next = [entry, ...read().filter((existing) => existing.url !== url)].slice(0, MAX_RECENT_SEARCHES);
    memoryEntries = next;
    if (!storageUnavailable) {
      try {
        const storage = getStorage();
        if (!storage) throw new Error("Storage unavailable");
        storage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        storageUnavailable = true;
      }
    }
    return [...next];
  }

  function clear(): boolean {
    memoryEntries = [];
    if (storageUnavailable) return false;
    try {
      const storage = getStorage();
      if (!storage) throw new Error("Storage unavailable");
      storage.setItem(RECENT_SEARCHES_STORAGE_KEY, "[]");
      return true;
    } catch {
      storageUnavailable = true;
      return false;
    }
  }

  return { read, record, clear };
}

const recentSearchStore = createRecentSearchStore();

export const readRecentSearches = () => recentSearchStore.read();
export const clearRecentSearches = () => recentSearchStore.clear();

/**
 * Preferred API: pass the committed canonical URL and a shopper-facing label.
 * The string form keeps older query-only callers working until they pass URLs.
 */
export function recordRecentSearch(input: RecentSearchInput | string | null | undefined): void {
  if (typeof input === "string") {
    const label = cleanLabel(input);
    if (label) recentSearchStore.record({ url: `/search?query=${encodeURIComponent(label)}`, label });
    return;
  }
  if (input) recentSearchStore.record(input);
}
