import { Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatBDT, formatDate } from "@/lib/format";
import type { OwnerNextInstallment } from "@/features/ownerPortal/queries";

/**
 * Chapter 3 Prompt 3 §10 — gives the next installment visual priority.
 * No "Pay Now" button: no payment gateway exists yet, and the brief is
 * explicit that a fake one must never be built (§42) — this is purely an
 * honest, clearly-labelled information surface, ready for that
 * integration point later.
 */
export function NextPaymentCard({ installment }: { installment: OwnerNextInstallment | null }) {
  if (!installment) {
    return (
      <div className="border-border rounded-2xl border p-7 text-center">
        <p className="text-body text-fg font-medium">No upcoming installment</p>
        <p className="text-body-sm text-fg-muted mt-1">You&apos;re all caught up — nothing due right now.</p>
      </div>
    );
  }

  return (
    <div className="border-accent/40 bg-accent-soft rounded-2xl border p-7 shadow-sm sm:p-8">
      <p className="text-label text-accent flex items-center gap-2 uppercase">
        <Clock aria-hidden className="size-4" />
        Next Payment
      </p>
      <p className="text-h2 text-fg mt-3">{installment.label}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-caption text-fg-subtle uppercase">Due</p>
          <p className="text-body-sm text-fg mt-0.5">{formatDate(new Date(installment.dueDate))}</p>
        </div>
        <div className="text-right">
          <p className="text-caption text-fg-subtle uppercase">Remaining</p>
          <p className="text-h2 text-fg mt-0.5">{formatBDT(installment.amount)}</p>
        </div>
      </div>
      <StatusBadge status={installment.status} className="mt-5" />
    </div>
  );
}
