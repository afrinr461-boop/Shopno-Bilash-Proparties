import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PropertySwitcherItem {
  unitId: string;
  unitNumber: string;
  projectName: string;
}

/**
 * Prompt 2 §14 — only rendered when the owner has more than one property.
 * A compact pill row (not a dropdown) reads better on mobile and makes
 * every property one tap away instead of two. `section` keeps the
 * switcher on the same page type ("property"/"payments"/"construction")
 * — it used to hardcode "property", so switching properties from the
 * Payments or Construction detail page silently bounced the owner to the
 * generic overview instead of the other property's Payments/Construction
 * page.
 */
export function PropertySwitcher({
  base,
  section,
  items,
  activeUnitId,
}: {
  base: string;
  section: "property" | "payments" | "construction";
  items: PropertySwitcherItem[];
  activeUnitId: string;
}) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="My properties" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {items.map((item) => {
        const active = item.unitId === activeUnitId;
        return (
          <Link
            key={item.unitId}
            href={`${base}/${section}/${item.unitId}`}
            aria-current={active}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-body-sm whitespace-nowrap transition-colors",
              active ? "border-accent bg-accent-soft text-accent" : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
            )}
          >
            {item.projectName} · {item.unitNumber}
          </Link>
        );
      })}
    </nav>
  );
}
