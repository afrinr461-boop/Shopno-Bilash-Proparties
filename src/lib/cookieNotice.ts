/**
 * Tiny external store (same `useSyncExternalStore` pattern as
 * `lib/savedProperties.ts`) for whether the local-storage notice has been
 * dismissed. The server snapshot is always "dismissed" so nothing renders
 * during SSR/hydration — the banner only ever appears after the client
 * has actually checked local storage, never as a flash-then-remove.
 */
const KEY = "sbp-cookie-notice-dismissed";

let dismissed: boolean | null = null;
const listeners = new Set<() => void>();

function ensureChecked() {
  if (dismissed !== null || typeof window === "undefined") return;
  try {
    dismissed = window.localStorage.getItem(KEY) === "1";
  } catch {
    dismissed = false;
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): boolean {
  ensureChecked();
  return dismissed ?? false;
}

export function getServerSnapshot(): boolean {
  return true;
}

export function dismissCookieNotice() {
  dismissed = true;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // Storage unavailable — the notice simply reappears next visit, which is harmless.
  }
  listeners.forEach((listener) => listener());
}
