import { STATUS_CONFIG, type StatusKey } from "@/lib/status";
import { EmptyState } from "@/components/feedback/EmptyState";

export interface DistributionBarProps {
  title: string;
  entries: { key: StatusKey; count: number }[];
}

/**
 * A real proportional breakdown — bar widths come directly from each
 * entry's share of the real total, never an invented trend or curve.
 * Reuses `STATUS_CONFIG` for labels so a status reads identically here
 * and on every list page's `StatusBadge`.
 */
export function DistributionBar({ title, entries }: DistributionBarProps) {
  const total = entries.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="border-border bg-surface-raised flex flex-col gap-4 rounded-lg border p-4">
      <h2 className="text-label text-fg-subtle uppercase">{title}</h2>
      {total === 0 ? (
        <EmptyState title="No data yet" description="A breakdown will appear here once real records exist." />
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map(({ key, count }) => {
            const config = STATUS_CONFIG[key];
            const percent = Math.round((count / total) * 100);
            return (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="text-body-sm flex items-center justify-between">
                  <span className="text-fg">{config.label}</span>
                  <span className="text-fg-muted tabular-nums">
                    {count} · {percent}%
                  </span>
                </div>
                <div className="bg-surface h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-accent h-full rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
