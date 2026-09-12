import { CalendarClock } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDate } from "@/lib/format";
import type { OwnerConstructionUpdate } from "@/features/ownerPortal/queries";

/** Chapter 3 Prompt 4 §16/§19 — the owner-facing construction journal. Only `activity` and `date` are ever shown (never `.notes`/contractor/internal fields — those stay admin-only, matching every other "notes" field in this codebase). */
export function ConstructionUpdatesFeed({ updates }: { updates: OwnerConstructionUpdate[] }) {
  if (updates.length === 0) {
    return <EmptyState title="No recent construction updates" description="No recent construction updates have been published yet." />;
  }

  return (
    <ul className="flex flex-col gap-4">
      {updates.map((u) => (
        <li key={u.id} className="border-border bg-surface-raised rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2">
            <CalendarClock aria-hidden className="text-fg-subtle size-3.5" />
            <p className="text-caption text-fg-subtle">
              {formatDate(new Date(u.date))}
              {u.phaseName ? ` · ${u.phaseName}` : ""}
            </p>
          </div>
          <p className="text-body text-fg mt-2">{u.activity}</p>
          {u.photos.length > 0 && (
            <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
              {u.photos.map((photo) => (
                <Media key={photo.url} ratio="square" src={photo.url} alt={photo.name} containerClassName="size-20 shrink-0" radius="md" />
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
