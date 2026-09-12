"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { PROJECT_STATUS_LABEL, type Project, type ProjectStatus } from "@/content/projects";
import { cn } from "@/lib/utils";

export interface ProjectFiltersProps {
  projects: Project[];
  /** Live count of the currently-matching results, for the result count + mobile "Show N" button. */
  resultCount: number;
}

type FilterKey = "q" | "type" | "status" | "city";

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-body-sm h-11 w-full appearance-none rounded-md border border-border-strong bg-surface-raised py-0 pr-9 pl-3.5 text-fg outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent-soft"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="text-fg-subtle pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
      />
    </div>
  );
}

/**
 * Search + Type/Status/City filters. Client-side only (the dataset is
 * small and already loaded, so filtering is instant with no server
 * round-trip) but the selection is reflected in the URL via
 * `router.replace` so the page is refreshable/shareable/back-button-safe
 * (brief §13) without opting into a full server refetch per keystroke.
 * Desktop: an inline bar. Mobile: a trigger button + full-screen sheet —
 * same controls, no duplicated logic.
 */
export function ProjectFilters({ projects, resultCount }: ProjectFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const status = searchParams.get("status") ?? "";
  const city = searchParams.get("city") ?? "";
  const activeCount = [q, type, status, city].filter(Boolean).length;

  const options = useMemo(() => {
    const uniq = (values: (string | undefined)[]) =>
      Array.from(new Set(values.filter((v): v is string => !!v))).sort();

    return {
      type: uniq(projects.map((p) => p.projectType)).map((v) => ({ value: v, label: v })),
      status: uniq(projects.map((p) => p.status)).map((v) => ({
        value: v,
        label: PROJECT_STATUS_LABEL[v as ProjectStatus],
      })),
      city: uniq(projects.map((p) => p.city)).map((v) => ({ value: v, label: v })),
    };
  }, [projects]);

  function updateParam(key: FilterKey, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  const searchField = (
    <div className="relative flex-1">
      <Search aria-hidden className="text-fg-subtle absolute top-1/2 left-0 size-4 -translate-y-1/2" />
      <input
        type="search"
        value={q}
        onChange={(e) => updateParam("q", e.target.value)}
        placeholder="Search projects"
        aria-label="Search projects by name, location or type"
        className="text-body-sm h-11 w-full border-b border-border-strong bg-transparent py-2 pl-6 text-fg outline-none transition-colors duration-150 placeholder:text-fg-subtle focus:border-accent"
      />
    </div>
  );

  const selectFields = (
    <>
      <FilterSelect label="Type" value={type} onChange={(v) => updateParam("type", v)} options={options.type} />
      <FilterSelect
        label="Status"
        value={status}
        onChange={(v) => updateParam("status", v)}
        options={options.status}
      />
      <FilterSelect label="City" value={city} onChange={(v) => updateParam("city", v)} options={options.city} />
    </>
  );

  return (
    <div className="border-border border-y">
      {/* Desktop / tablet inline bar */}
      <div className="hidden items-center gap-4 py-5 md:flex">
        {searchField}
        <div className="flex shrink-0 gap-3">{selectFields}</div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-label text-fg-subtle hover:text-fg inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap uppercase transition-colors"
          >
            <X aria-hidden className="size-3.5" />
            Clear all
          </button>
        )}
        <p className="text-caption text-fg-subtle ml-auto shrink-0 whitespace-nowrap tabular-nums">
          {resultCount} {resultCount === 1 ? "Development" : "Developments"}
        </p>
      </div>

      {/* Mobile trigger */}
      <div className="flex items-center justify-between gap-4 py-4 md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className="text-body-sm border-border-strong inline-flex h-11 items-center gap-2 rounded-md border px-4"
        >
          <SlidersHorizontal aria-hidden className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="bg-accent text-accent-foreground inline-flex size-5 items-center justify-center rounded-full text-[11px] font-semibold">
              {activeCount}
            </span>
          )}
        </button>
        <p className="text-caption text-fg-subtle tabular-nums">
          {resultCount} {resultCount === 1 ? "Development" : "Developments"}
        </p>
      </div>

      {/* Mobile full-screen filter sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter projects"
        aria-hidden={!sheetOpen}
        inert={!sheetOpen || undefined}
        className={cn(
          "bg-bg fixed inset-0 z-40 flex flex-col overflow-y-auto px-6 pt-28 pb-8 transition-opacity duration-300 ease-[var(--ease-standard)] md:hidden",
          sheetOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <button
          type="button"
          onClick={() => setSheetOpen(false)}
          aria-label="Close filters"
          className="absolute top-20 right-6 flex size-11 items-center justify-center"
        >
          <X aria-hidden className="size-5" />
        </button>

        <p className="text-label text-fg-subtle mb-6 uppercase">Filter Projects</p>
        <div className="flex flex-col gap-5">
          {searchField}
          {selectFields}
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="text-button bg-accent text-accent-foreground hover:bg-accent-strong flex h-12 items-center justify-center rounded-md transition-colors"
          >
            Show {resultCount} {resultCount === 1 ? "Development" : "Developments"}
          </button>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-button text-fg-muted flex h-12 items-center justify-center"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
