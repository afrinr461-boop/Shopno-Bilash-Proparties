import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils";

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  /** A filter bar, tabs, or similar row rendered below the title block. */
  children?: ReactNode;
  className?: string;
}

/**
 * The one page-header shape every future Admin module page should reach
 * for (brief §9) — title/description on the left, actions on the right,
 * an optional filter/tab row underneath. Not a page layout itself: a
 * module page still renders its own content below this.
 */
export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  children,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("border-border border-b px-4 py-5 sm:px-6 sm:py-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="mb-3" />}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2">{title}</h1>
          {description && <p className="text-body-sm text-fg-muted mt-1 max-w-2xl">{description}</p>}
        </div>
        {(primaryAction || secondaryActions) && (
          <div className="flex shrink-0 items-center gap-2.5">
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
