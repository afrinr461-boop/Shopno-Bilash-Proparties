import { formatBDT, formatDate } from "@/lib/format";
import { OWNER_ADJUSTMENT_TYPE_LABEL } from "@/lib/ownerFriendlyLabels";
import type { OwnerAdjustment } from "@/features/ownerPortal/queries";

/** Chapter 3 Prompt 3 §15 — real `ContributionAdjustment` rows only; amounts are shown exactly as signed by the admin, never re-derived. */
export function AdjustmentsList({ adjustments }: { adjustments: OwnerAdjustment[] }) {
  if (adjustments.length === 0) return null;

  return (
    <ul className="border-border bg-surface-raised divide-border divide-y overflow-hidden rounded-2xl border shadow-sm">
      {adjustments.map((a) => (
        <li key={a.id} className="hover:bg-surface flex items-start justify-between gap-3 p-5 transition-colors">
          <div className="min-w-0">
            <p className="text-body text-fg font-medium">
              {OWNER_ADJUSTMENT_TYPE_LABEL[a.type] ?? a.type} · {a.allocationTitle}
            </p>
            <p className="text-body-sm text-fg-muted mt-0.5">{a.reason}</p>
            <p className="text-caption text-fg-subtle mt-1">{formatDate(new Date(a.date))}</p>
          </div>
          <p className={`text-body shrink-0 font-medium ${a.amount < 0 ? "text-success" : "text-fg"}`}>
            {a.amount < 0 ? "− " : "+ "}
            {formatBDT(Math.abs(a.amount))}
          </p>
        </li>
      ))}
    </ul>
  );
}
