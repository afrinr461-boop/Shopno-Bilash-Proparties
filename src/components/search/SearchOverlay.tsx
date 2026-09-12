"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, Search, X } from "lucide-react";
import { Media } from "@/components/ui/Media";
import {
  CATEGORY_LABEL,
  DISCOVERY_SHORTCUTS,
  groupResults,
  searchIndex,
  type GroupedResults,
  type SearchIndexData,
  type SearchItem,
} from "@/lib/searchIndex";
import { addRecentSearch, clearRecentSearches, getRecentSearches } from "@/lib/recentSearches";
import { cn } from "@/lib/utils";
import { useSearch } from "./SearchContext";

/** Flattened in the exact order rows are rendered — its index doubles as the keyboard `activeIndex`, so DOM order and this array must always match. */
type FlatEntry =
  | { kind: "recent"; term: string }
  | { kind: "discovery"; href: string; label: string }
  | { kind: "result"; item: SearchItem };

function buildFlatEntries(
  query: string,
  grouped: GroupedResults[],
  recent: string[],
  failed: boolean,
): FlatEntry[] {
  if (failed) return DISCOVERY_SHORTCUTS.map((s) => ({ kind: "discovery", href: s.href, label: s.label }));
  if (!query.trim()) {
    return [
      ...recent.map((term): FlatEntry => ({ kind: "recent", term })),
      ...DISCOVERY_SHORTCUTS.map((s): FlatEntry => ({ kind: "discovery", href: s.href, label: s.label })),
    ];
  }
  if (grouped.length === 0) {
    return DISCOVERY_SHORTCUTS.map((s) => ({ kind: "discovery", href: s.href, label: s.label }));
  }
  return grouped.flatMap((g) => g.items.map((item): FlatEntry => ({ kind: "result", item })));
}

function entryKey(entry: FlatEntry): string {
  switch (entry.kind) {
    case "recent":
      return `recent:${entry.term}`;
    case "discovery":
      return `discovery:${entry.href}`;
    case "result":
      return `result:${entry.item.type}:${entry.item.id}`;
  }
}

/**
 * The full command-search experience: header input, categorized real-data
 * results, keyboard navigation, and hand-off to the existing branded
 * `SitePageLoader` for every navigable row (brief §22) — rows are
 * real `<Link>`/`<button>` elements; keyboard Enter activates the row
 * currently under `activeIndex` by calling its own `.click()` rather than
 * pushing a route directly, so it goes through the exact same click
 * pipeline a mouse click would (no second, competing transition system).
 */
export function SearchOverlay({ searchData }: { searchData: SearchIndexData }) {
  const { open, closeSearch } = useSearch();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const { grouped, failed } = useMemo(() => {
    try {
      return { grouped: groupResults(searchIndex(query, searchData)), failed: false };
    } catch {
      return { grouped: [] as GroupedResults[], failed: true };
    }
  }, [query, searchData]);

  const flatEntries = useMemo(
    () => buildFlatEntries(query, grouped, recent, failed),
    [query, grouped, recent, failed],
  );

  const indexOf = useMemo(() => {
    const map = new Map<string, number>();
    flatEntries.forEach((entry, i) => map.set(entryKey(entry), i));
    return map;
  }, [flatEntries]);

  // Reset the keyboard selection whenever the query changes — React's
  // documented "adjusting state when a prop changes" pattern (state
  // compared during render, not an effect) since this is purely derived
  // state, not a synchronization with anything external.
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  // Same pattern for the open/close transition: reset the selection and
  // (only when opening) refresh the recent-searches list from storage, in
  // case it changed since the overlay last closed.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setActiveIndex(0);
    if (open) setRecent(getRecentSearches());
  }

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;
    inputRef.current?.focus();
    return () => {
      const restore = previouslyFocused.current;
      if (restore instanceof HTMLElement) restore.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const container = listRef.current;
    const el = container?.querySelectorAll<HTMLElement>("[data-search-item]")[activeIndex];
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setQuery("");
        closeSearch();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatEntries.length - 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        const container = listRef.current;
        const el = container?.querySelectorAll<HTMLElement>("[data-search-item]")[activeIndex];
        if (el) {
          event.preventDefault();
          el.click();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, flatEntries.length, activeIndex, closeSearch]);

  function commitSearch() {
    if (query.trim()) addRecentSearch(query);
  }

  function handleClose() {
    setQuery("");
    closeSearch();
  }

  /** Every navigable row (result, discovery shortcut, "View all") must close the overlay on selection — it should never be left open behind the destination page. */
  function handleNavigate() {
    commitSearch();
    handleClose();
  }

  const showingResults = query.trim().length > 0 && !failed;
  const noResults = showingResults && grouped.length === 0;

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[90] flex justify-center transition-opacity duration-300 ease-[var(--ease-standard)] sm:pt-[10vh]",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div
        aria-hidden
        onClick={handleClose}
        className="bg-fg/40 absolute inset-0 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        inert={!open || undefined}
        className={cn(
          "bg-bg relative flex h-full w-full flex-col overflow-hidden transition-[transform,opacity] duration-300 ease-[var(--ease-standard)] sm:h-auto sm:max-h-[74vh] sm:w-full sm:max-w-xl sm:rounded-lg sm:border sm:border-border sm:shadow-sm",
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0",
        )}
      >
        <div className="border-border flex items-center gap-3 border-b px-5 py-4 sm:px-6">
          <Search aria-hidden className="text-fg-subtle size-5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, properties, services…"
            aria-label="Search the site"
            autoComplete="off"
            spellCheck={false}
            className="text-body placeholder:text-fg-subtle w-full bg-transparent text-fg outline-none"
          />
          <span className="text-caption border-border text-fg-subtle hidden shrink-0 rounded border px-1.5 py-0.5 font-mono sm:inline">
            ESC
          </span>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close search"
            className="text-fg-muted hover:text-fg flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-surface"
          >
            <X aria-hidden className="size-4.5" />
          </button>
        </div>

        <div ref={listRef} className="thin-scrollbar flex-1 overflow-y-auto px-3 py-3 sm:px-4">
          {failed && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <AlertTriangle aria-hidden className="text-fg-subtle size-6" />
              <p className="text-body text-fg-muted">Search is temporarily unavailable.</p>
              <DiscoveryRow onNavigate={handleNavigate} indexOf={indexOf} activeIndex={activeIndex} />
            </div>
          )}

          {!failed && !showingResults && (
            <>
              {recent.length > 0 && (
                <section className="mb-4">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <h3 className="text-label text-fg-subtle uppercase">Recent</h3>
                    <button
                      type="button"
                      onClick={() => {
                        clearRecentSearches();
                        setRecent([]);
                      }}
                      className="text-caption text-fg-subtle hover:text-fg"
                    >
                      Clear
                    </button>
                  </div>
                  <ul>
                    {recent.map((term) => {
                      const isActive = indexOf.get(`recent:${term}`) === activeIndex;
                      return (
                        <li key={term}>
                          <button
                            type="button"
                            data-search-item
                            onClick={() => {
                              setQuery(term);
                              inputRef.current?.focus();
                            }}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left",
                              isActive ? "bg-surface text-fg" : "text-fg-muted hover:bg-surface hover:text-fg",
                            )}
                          >
                            <Clock aria-hidden className="text-fg-subtle size-4 shrink-0" />
                            <span className="text-body-sm truncate">{term}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              <section>
                <h3 className="text-label text-fg-subtle mb-2 px-2 uppercase">Explore</h3>
                <DiscoveryRow onNavigate={handleNavigate} indexOf={indexOf} activeIndex={activeIndex} />
              </section>
            </>
          )}

          {noResults && (
            <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
              <p className="text-body text-fg-muted">No results found for &ldquo;{query}&rdquo;.</p>
              <DiscoveryRow
                onNavigate={handleNavigate}
                indexOf={indexOf}
                activeIndex={activeIndex}
                label="Try instead"
              />
            </div>
          )}

          {showingResults &&
            grouped.map((group) => (
              <section key={group.type} className="mb-4 last:mb-0">
                <div className="mb-2 flex items-baseline justify-between px-2">
                  <h3 className="text-label text-fg-subtle uppercase">{CATEGORY_LABEL[group.type]}</h3>
                  {group.totalCount > group.items.length && (
                    <Link
                      href={categoryViewAllHref(group.type)}
                      data-search-item
                      onClick={handleNavigate}
                      className="text-caption text-accent hover:text-accent-strong"
                    >
                      View all {group.totalCount}
                    </Link>
                  )}
                </div>
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive = indexOf.get(`result:${item.type}:${item.id}`) === activeIndex;
                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <ResultRow item={item} active={isActive} onClick={handleNavigate} />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
        </div>

        <div className="border-border text-caption text-fg-subtle hidden items-center gap-4 border-t px-6 py-3 sm:flex">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> Select
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}

function categoryViewAllHref(type: SearchItem["type"]): string {
  switch (type) {
    case "project":
      return "/projects";
    case "property":
      return "/properties";
    case "service":
      return "/services";
    case "news":
      return "/news";
    case "page":
      return "/";
  }
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="border-border rounded border px-1.5 py-0.5 font-mono">{children}</span>
  );
}

function DiscoveryRow({
  indexOf,
  activeIndex,
  onNavigate,
  label,
}: {
  indexOf: Map<string, number>;
  activeIndex: number;
  onNavigate: () => void;
  label?: string;
}) {
  return (
    <ul className={label ? "flex flex-wrap justify-center gap-2" : "flex flex-col gap-1"}>
      {DISCOVERY_SHORTCUTS.map((shortcut) => {
        const isActive = indexOf.get(`discovery:${shortcut.href}`) === activeIndex;
        return (
          <li key={shortcut.href}>
            <Link
              href={shortcut.href}
              data-search-item
              onClick={onNavigate}
              className={cn(
                label
                  ? "text-body-sm border-border-strong rounded-md border px-3 py-1.5 hover:border-fg-subtle"
                  : cn(
                      "flex items-center justify-between gap-2.5 rounded-md px-2.5 py-2",
                      isActive ? "bg-surface text-fg" : "text-fg-muted hover:bg-surface hover:text-fg",
                    ),
              )}
            >
              <span className="text-body-sm">{shortcut.label}</span>
              {!label && <ArrowRight aria-hidden className="size-3.5 shrink-0" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ResultRow({ item, active, onClick }: { item: SearchItem; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={item.href}
      data-search-item
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3.5 rounded-md px-2.5 py-2.5 transition-colors",
        active ? "bg-surface" : "hover:bg-surface",
      )}
    >
      {item.image ? (
        <Media
          src={item.image.src}
          alt=""
          ratio="square"
          containerClassName="size-12 shrink-0 rounded-sm"
          className="transition-transform duration-300 ease-[var(--ease-standard)] group-hover:scale-105"
        />
      ) : (
        <div className="bg-surface text-fg-subtle flex size-12 shrink-0 items-center justify-center rounded-sm">
          <span className="text-label uppercase">{item.title.charAt(0)}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-body-sm truncate text-fg">{item.title}</p>
        {item.subtitle && <p className="text-caption text-fg-subtle truncate">{item.subtitle}</p>}
      </div>
      {item.meta && <span className="text-caption text-fg-subtle hidden shrink-0 sm:inline">{item.meta}</span>}
    </Link>
  );
}
