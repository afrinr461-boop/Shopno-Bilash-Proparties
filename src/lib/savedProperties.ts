/**
 * Local-only "saved properties" — a tiny external store (React's own
 * `useSyncExternalStore` pattern) over unit ids kept in this browser, so a
 * shortlist survives between visits on the same device. No account, no
 * server, nothing sent anywhere — mirrors the local-storage approach
 * already used for recent searches (`lib/recentSearches.ts`), but as a
 * shared store rather than per-component state, since the header badge,
 * every property card's save button, and the /saved page all need to stay
 * in sync with each other without a Context provider.
 */
const KEY = "sbp-saved-properties";
const EMPTY: string[] = [];

let ids: string[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function writeToStorage(next: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private browsing, disabled) — saving is a convenience, never required.
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  ids = readFromStorage();
  hydrated = true;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** For `useSyncExternalStore` — reads lazily on first client call so this module has no SSR-vs-client mismatch. */
export function getSnapshot(): string[] {
  ensureHydrated();
  return ids;
}

export function getServerSnapshot(): string[] {
  return EMPTY;
}

export function isSaved(id: string): boolean {
  return getSnapshot().includes(id);
}

export function toggleSaved(id: string) {
  ensureHydrated();
  ids = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  writeToStorage(ids);
  listeners.forEach((listener) => listener());
}
