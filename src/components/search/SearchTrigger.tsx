"use client";

import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
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
  tone?: "default" | "inverted";
  /** "full" is the labeled pill for the desktop header; "compact" is the icon-only button for mobile, next to the menu button. */
  variant?: "full" | "compact";
}

/** Deliberately quiet — a thin outlined pill, not a filled button, so it reads as a utility rather than competing with the primary CTA (brief §2). */
export function SearchTrigger({ tone = "default", variant = "full" }: SearchTriggerProps) {
  const { openSearch } = useSearch();
  const shortcut = useShortcutLabel();
  const inverted = tone === "inverted";

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search (Ctrl+K)"
        className={cn(
          "flex size-10 items-center justify-center rounded-md transition-colors lg:hidden",
          inverted ? "text-white/90 hover:bg-white/10" : "text-fg-muted hover:bg-surface hover:text-fg",
        )}
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
      className={cn(
        "hidden items-center gap-2.5 rounded-md border px-3 py-1.5 transition-colors lg:flex",
        inverted
          ? "border-white/20 text-white/80 hover:border-white/40 hover:text-white"
          : "border-border-strong text-fg-muted hover:border-fg-subtle hover:text-fg",
      )}
    >
      <Search aria-hidden className="size-4" />
      <span className="text-body-sm">Search</span>
      <span
        aria-hidden
        className={cn(
          "text-caption rounded border px-1.5 py-0.5 font-mono",
          inverted ? "border-white/20 text-white/60" : "border-border text-fg-subtle",
        )}
      >
        {shortcut}
      </span>
    </button>
  );
}
