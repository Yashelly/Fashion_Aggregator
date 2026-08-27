/**
 * Recent-search history, persisted per-browser in localStorage. Client-only and
 * best-effort, in line with the synthetic-demo boundary: no server, no account.
 * Written by the search page's analytics tracker and read by the account
 * dashboard, so the "Recent searches" card reflects real activity instead of a
 * hard-coded empty state.
 */

const STORAGE_KEY = "weft-recent-searches";
const MAX_ENTRIES = 8;

export type RecentSearch = { query: string; at: number };

export function readRecentSearches(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is RecentSearch =>
          Boolean(entry) &&
          typeof entry === "object" &&
          typeof (entry as RecentSearch).query === "string",
      )
      .map((entry) => ({
        query: entry.query,
        at: typeof entry.at === "number" ? entry.at : 0,
      }))
      .slice(0, MAX_ENTRIES);
  } catch {
    // Storage can be unavailable or hold incompatible data; fall back to empty.
    return [];
  }
}

export function recordRecentSearch(query: string | null | undefined): void {
  const trimmed = query?.trim();
  if (!trimmed) return;

  try {
    const deduped = readRecentSearches().filter(
      (entry) => entry.query.toLowerCase() !== trimmed.toLowerCase(),
    );
    const next = [{ query: trimmed, at: Date.now() }, ...deduped].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Best-effort: a failed write just means this search isn't remembered.
  }
}
