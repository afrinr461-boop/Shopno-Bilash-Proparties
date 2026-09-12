import Link from "next/link";
import { Car } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import type { Parking } from "@/types/parking";

export interface UnitParkingPanelProps {
  parkingSpaces: Parking[];
}

/** Read-only — parking is owner-mediated, not unit-linked (a parking space's owner can differ from any unit's owner), so this shows spaces assigned to the SAME owner as this unit, not a direct structural link. */
export function UnitParkingPanel({ parkingSpaces }: UnitParkingPanelProps) {
  if (parkingSpaces.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="No parking assigned to this owner"
        description="This unit's owner has no parking spaces assigned yet."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {parkingSpaces.map((p) => (
        <Link
          key={p.id}
          href={`/admin/parking/${p.id}`}
          className="border-border bg-surface-raised flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-fg-subtle"
        >
          <div>
            <p className="text-body-sm text-fg font-medium">{p.parkingNumber}</p>
            <p className="text-caption text-fg-subtle">{p.zone ?? "No zone set"}</p>
          </div>
          <StatusBadge status={p.status} />
        </Link>
      ))}
    </div>
  );
}
