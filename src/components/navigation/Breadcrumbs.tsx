import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Minimal, unobtrusive — for deep pages (project/property detail) only. Never on the homepage. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-caption text-fg-subtle hover:text-fg-muted transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-caption text-fg-muted"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight aria-hidden className="size-3 text-fg-subtle" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
