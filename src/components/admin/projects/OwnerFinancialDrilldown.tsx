"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatBDT } from "@/lib/format";

export interface DrilldownRow {
  goalTitle: string;
  unitNumber: string;
  payableAmount: number;
}

export interface OwnerFinancialDrilldownProps {
  rows: DrilldownRow[];
}

/** Inline expandable unit → goal → amount breakdown — keeps the Owners tab as one canonical place to scan and drill into every owner's financial picture, instead of a second duplicate view. */
export function OwnerFinancialDrilldown({ rows }: OwnerFinancialDrilldownProps) {
  const [open, setOpen] = useState(false);

  if (rows.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-caption text-accent hover:text-accent-strong inline-flex items-center gap-1 transition-colors"
      >
        {open ? <ChevronDown aria-hidden className="size-3" /> : <ChevronRight aria-hidden className="size-3" />}
        {open ? "Hide breakdown" : "Show breakdown"}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1">
          {rows.map((row, i) => (
            <p key={i} className="text-caption text-fg-subtle">
              {row.unitNumber} — {row.goalTitle}: {formatBDT(row.payableAmount)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
