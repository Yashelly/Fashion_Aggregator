export type SearchCacheStatus = "hit" | "miss" | "shared";

export type SearchRuntimeMode =
  | "browse"
  | "objective"
  | "hybrid-confirmed"
  | "hybrid-or-fallback";

export type SearchRuntimeDiagnostics = {
  cacheStatus: SearchCacheStatus | "bypass";
  durationMs: number;
  mode: SearchRuntimeMode;
};

type LoadedValue<T> = {
  cacheable: boolean;
  value: T;
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

type CacheOptions = {
  maxEntries: number;
  now?: () => number;
  ttlMs: number;
};

/**
 * Small process-local TTL/LRU cache with in-flight request coalescing.
 * Loaders decide whether a result is safe to retain; non-cacheable results are
 * still shared with concurrent callers but are never served to later requests.
 */
export class SearchRuntimeCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();
  private readonly pending = new Map<string, Promise<LoadedValue<T>>>();
  private readonly maxEntries: number;
  private readonly now: () => number;
  private readonly ttlMs: number;

  constructor({ maxEntries, now = Date.now, ttlMs }: CacheOptions) {
    if (!Number.isInteger(maxEntries) || maxEntries < 1) {
      throw new Error("maxEntries must be a positive integer");
    }
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
      throw new Error("ttlMs must be positive");
    }
    this.maxEntries = maxEntries;
    this.now = now;
    this.ttlMs = ttlMs;
  }

  private get(key: string) {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return null;
    }

    // Refresh insertion order so Map's first key remains the LRU entry.
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }

  private remember(key: string, value: T) {
    this.entries.delete(key);
    this.entries.set(key, {
      expiresAt: this.now() + this.ttlMs,
      value,
    });
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.entries.delete(oldest);
    }
  }

  async getOrLoad(
    key: string,
    load: () => Promise<LoadedValue<T>>,
  ): Promise<LoadedValue<T> & { status: SearchCacheStatus }> {
    const cached = this.get(key);
    if (cached !== null) {
      return { cacheable: true, status: "hit", value: cached };
    }

    const inFlight = this.pending.get(key);
    if (inFlight) {
      const loaded = await inFlight;
      return { ...loaded, status: "shared" };
    }

    const pending = load();
    this.pending.set(key, pending);
    try {
      const loaded = await pending;
      if (loaded.cacheable) this.remember(key, loaded.value);
      return { ...loaded, status: "miss" };
    } finally {
      this.pending.delete(key);
    }
  }
}
