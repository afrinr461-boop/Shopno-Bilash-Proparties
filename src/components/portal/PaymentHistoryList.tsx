import { Download, HardHat, Home } from "lucide-react";
import { formatBDT, formatDate } from "@/lib/format";
import { OWNER_PAYMENT_METHOD_LABEL } from "@/lib/ownerFriendlyLabels";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { OwnerPaymentHistoryEntry } from "@/features/ownerPortal/queries";

/**
 * Chapter 3 Prompt 3 §12/§13/§17 — every real payment record, each still
 * carrying its own `category` so a construction contribution and a
 * property/sale payment never read as the same thing. A receipt link only
 * appears when a real, owner-visible `Document` was actually filed
 * against that payment — never a fabricated download button.
 */
export function PaymentHistoryList({ payments }: { payments: OwnerPaymentHistoryEntry[] }) {
  if (payments.length === 0) {
    return <EmptyState title="No payment history yet" description="Payments recorded against your account will appear here." />;
  }

  return (
    <ul className="border-border bg-surface-raised divide-border divide-y overflow-hidden rounded-2xl border shadow-sm">
      {payments.map((p) => {
        const Icon = p.category === "property" ? Home : HardHat;
        return (
          <li key={p.id} className="hover:bg-surface flex items-start justify-between gap-3 p-5 transition-colors">
            <div className="flex items-start gap-3 min-w-0">
              <Icon aria-hidden className="text-fg-subtle mt-0.5 size-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-body text-fg font-medium">{p.label}</p>
                <p className="text-caption text-fg-subtle mt-0.5">
                  {formatDate(new Date(p.date))} · {OWNER_PAYMENT_METHOD_LABEL[p.method] ?? p.method}
                  {p.reference ? ` · Ref: ${p.reference}` : ""}
                </p>
                {p.receiptUrl && (
                  <a
                    href={p.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-caption text-accent hover:text-accent-strong mt-1.5 inline-flex items-center gap-1"
                  >
                    <Download aria-hidden className="size-3" />
                    {p.receiptName ?? "View Receipt"}
                  </a>
                )}
              </div>
            </div>
            <p className="text-body text-fg shrink-0 font-medium">{formatBDT(p.amount)}</p>
          </li>
        );
      })}
    </ul>
  );
}
