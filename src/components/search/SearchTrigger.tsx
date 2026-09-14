"use client";

import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { useSearch } from "./SearchContext";

// Never changes after mount, so subscribing is a no-op — this only exists to
// read a browser-only value (platform) without a server/client hydration
// mismatch: React renders `getServerSnapshot` during SSR and hydration, then
// reconciles to the real value right after, with no effect or setState call.
function subscribe() {
  return () => {};
}

function getShortcutLabel() {
  return /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent) ? "⌘K" : "Ctrl K";
}

function getServerShortcutLabel() {
  return "Ctrl K";
}

function useShortcutLabel() {
  return useSyncExternalStore(subscribe, getShortcutLabel, getServerShortcutLabel);
}

export interface SearchTriggerProps {
  /** "full" is the labeled pill for the desktop header; "compact" is the icon-only button for mobile, next to the menu button. */
  variant?: "full" | "compact";
}

/**
 * Deliberately quiet — a thin outlined pill, not a filled button, so it
 * reads as a utility rather than competing with the primary CTA (brief §2).
 *
 * Always white with `mix-blend-mode: difference` (see NavLink for why) so
 * it stays legible over the permanently-transparent header regardless of
 * what's behind it — the hover backgrounds stay very low-alpha so the
 * inverted patch they produce reads as a subtle highlight, not a block.
 */
export function SearchTrigger({ variant = "full" }: SearchTriggerProps) {
  const { openSearch } = useSearch();
  const shortcut = useShortcutLabel();

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search (Ctrl+K)"
        style={{ mixBlendMode: "difference" }}
        className="flex size-10 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 lg:hidden"
      >
        <Search aria-hidden className="size-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search (Ctrl+K)"
      style={{ mixBlendMode: "difference" }}
      className="hidden items-center gap-2.5 rounded-md border border-white/20 px-3 py-1.5 text-white/80 transition-colors hover:border-white/40 hover:text-white lg:flex"
    >
      <Search aria-hidden className="size-4" />
      <span className="text-body-sm">Search</span>
      <span aria-hidden className="text-caption rounded border border-white/20 px-1.5 py-0.5 font-mono text-white/60">
        {shortcut}
      </span>
    </button>
  );
}
