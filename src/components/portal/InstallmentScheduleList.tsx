"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatBDT, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OwnerInstallmentRow } from "@/features/ownerPortal/queries";

const FILTERS: { key: "all" | OwnerInstallmentRow["status"]; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "due", label: "Due" },
  { key: "partially-paid", label: "Partial" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
];

/** Chapter 3 Prompt 3 §8/§22 — the owner's full installment schedule with simple status filtering (not an admin accounting table — six pills, not a query builder). */
export function InstallmentScheduleList({ installments }: { installments: OwnerInstallmentRow[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const visible = filter === "all" ? installments : installments.filter((i) => i.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-body-sm whitespace-nowrap transition-colors",
              filter === f.key ? "border-accent bg-accent-soft text-accent" : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-body-sm text-fg-muted py-6 text-center">No installments match this filter.</p>
      ) : (
        <ul className="border-border bg-surface-raised divide-border divide-y overflow-hidden rounded-2xl border shadow-sm">
          {visible.map((row) => (
            <li key={row.id} className="hover:bg-surface flex items-center justify-between gap-3 p-5 transition-colors">
              <div className="min-w-0">
                <p className="text-body text-fg font-medium">{row.label}</p>
                <p className="text-body-sm text-fg-muted mt-0.5">Due {formatDate(new Date(row.dueDate))}</p>
                {row.status === "partially-paid" && (
                  <p className="text-caption text-fg-subtle mt-1">
                    {formatBDT(row.paidAmount)} of {formatBDT(row.payableAmount)} paid
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-body text-fg font-medium">{formatBDT(row.status === "paid" ? row.payableAmount : row.outstanding)}</p>
                <StatusBadge status={row.status} className="mt-1" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
