/**
 * Local-only "recent searches" — harmless search terms the visitor typed,
 * kept in this browser only. No personal information is derived or stored
 * beyond what the visitor typed into the search box, nothing is ever sent
 * anywhere, and there is no analytics tracking here (brief §13).
 */
const KEY = "sbp-recent-searches";
const MAX = 5;

function safeRead(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, MAX);
  } catch {
    return [];
  }
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  return safeRead();
}

export function addRecentSearch(term: string) {
  const trimmed = term.trim();
  if (!trimmed || typeof window === "undefined") return;
  try {
    const next = [trimmed, ...safeRead().filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private browsing, disabled) — recent searches are a convenience, never required.
  }
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
