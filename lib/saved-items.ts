export const SAVED_ITEMS_STORAGE_KEY = "weft-wishlist";
export const MAX_SAVED_ITEMS = 100;

type StorageLike = Pick<Storage, "getItem" | "setItem">;
type Listener = () => void;
type ExternalSubscriber = (
  listener: (key: string | null, newValue: string | null) => void,
) => () => void;

export type SavedItemsSnapshot = Readonly<{
  ids: readonly string[];
  storageAvailable: boolean;
}>;

function isValidId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 80 && /^[a-zA-Z0-9_-]+$/.test(value);
}

export function sanitizeSavedItemIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(isValidId))].slice(0, MAX_SAVED_ITEMS);
}

function parseSavedItemIds(raw: string | null): string[] {
  if (!raw) return [];
  try { return sanitizeSavedItemIds(JSON.parse(raw)); } catch { return []; }
}

function browserStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

const subscribeToBrowserStorage: ExternalSubscriber = (listener) => {
  if (typeof window === "undefined") return () => undefined;
  const handleStorage = (event: StorageEvent) => listener(event.key, event.newValue);
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
};

export function createSavedItemsStore(
  getStorage: () => StorageLike | null = browserStorage,
  subscribeExternal: ExternalSubscriber = subscribeToBrowserStorage,
) {
  let memoryIds: string[] = [];
  let storageUnavailable = false;
  let snapshot: SavedItemsSnapshot = { ids: [], storageAvailable: true };
  const listeners = new Set<Listener>();
  let unsubscribeExternal: (() => void) | null = null;

  function updateSnapshot(ids: string[], storageAvailable: boolean) {
    memoryIds = ids;
    snapshot = { ids: [...ids], storageAvailable };
    return snapshot;
  }

  function read(): SavedItemsSnapshot {
    if (storageUnavailable) return updateSnapshot(memoryIds, false);
    try {
      const storage = getStorage();
      if (!storage) {
        storageUnavailable = true;
        return updateSnapshot(memoryIds, false);
      }
      return updateSnapshot(parseSavedItemIds(storage.getItem(SAVED_ITEMS_STORAGE_KEY)), true);
    } catch {
      storageUnavailable = true;
      return updateSnapshot(memoryIds, false);
    }
  }

  function notify() { listeners.forEach((listener) => listener()); }

  function toggle(productId: string): SavedItemsSnapshot {
    if (!isValidId(productId)) return read();
    const current = read().ids;
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : sanitizeSavedItemIds([...current, productId]);
    memoryIds = [...next];
    if (!storageUnavailable) {
      try {
        const storage = getStorage();
        if (!storage) throw new Error("Storage unavailable");
        storage.setItem(SAVED_ITEMS_STORAGE_KEY, JSON.stringify(next));
      } catch { storageUnavailable = true; }
    }
    const result = updateSnapshot(next, !storageUnavailable);
    notify();
    return result;
  }

  function clear(): SavedItemsSnapshot {
    memoryIds = [];
    if (!storageUnavailable) {
      try {
        const storage = getStorage();
        if (!storage) throw new Error("Storage unavailable");
        storage.setItem(SAVED_ITEMS_STORAGE_KEY, "[]");
      } catch { storageUnavailable = true; }
    }
    const result = updateSnapshot([], !storageUnavailable);
    notify();
    return result;
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    if (!unsubscribeExternal) {
      unsubscribeExternal = subscribeExternal((key, raw) => {
        if (key !== SAVED_ITEMS_STORAGE_KEY) return;
        storageUnavailable = false;
        updateSnapshot(parseSavedItemIds(raw), true);
        notify();
      });
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && unsubscribeExternal) {
        unsubscribeExternal();
        unsubscribeExternal = null;
      }
    };
  }

  return { read, subscribe, toggle, clear, getSnapshot: () => snapshot };
}

const savedItemsStore = createSavedItemsStore();
export const readSavedItems = () => savedItemsStore.read();
export const subscribeSavedItems = (listener: Listener) => savedItemsStore.subscribe(listener);
export const toggleSavedItem = (productId: string) => savedItemsStore.toggle(productId);
export const clearSavedItems = () => savedItemsStore.clear();
