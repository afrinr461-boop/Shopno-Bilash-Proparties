import { formatDate } from "@/lib/format";
import type { OwnerScheduleUpdate } from "@/features/ownerPortal/queries";

/** Chapter 3 Prompt 4 §12/§13 — calm, transparent before/after dates only. The admin's free-text `reason` never reaches this component on purpose (see `getOwnerConstructionDetail`'s doc comment) — no internal blame, contractor disputes, or operational commentary. */
export function ScheduleUpdatesList({ updates }: { updates: OwnerScheduleUpdate[] }) {
  if (updates.length === 0) return null;

  return (
    <ul className="border-border bg-surface-raised divide-border divide-y overflow-hidden rounded-2xl border shadow-sm">
      {updates.map((u) => (
        <li key={u.id} className="p-5">
          <p className="text-body text-fg font-medium">{u.phaseName}</p>
          <p className="text-body-sm text-fg-muted mt-1">Schedule Update — the estimated timeline for this stage has been adjusted.</p>
          <div className="mt-3 flex items-center gap-6">
            <div>
              <p className="text-caption text-fg-subtle uppercase">Previous Target</p>
              <p className="text-body-sm text-fg mt-0.5">{formatDate(new Date(u.previousTargetDate))}</p>
            </div>
            <div>
              <p className="text-caption text-fg-subtle uppercase">Updated Target</p>
              <p className="text-body-sm text-fg mt-0.5">{formatDate(new Date(u.newTargetDate))}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
