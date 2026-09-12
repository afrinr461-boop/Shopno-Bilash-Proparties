import { formatBDT } from "@/lib/format";
import type { Sale } from "@/types/sales";

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <p className={muted ? "text-body-sm text-fg-muted" : "text-body text-fg"}>{label}</p>
      <p className={muted ? "text-body-sm text-fg-muted" : "text-body text-fg font-medium"}>{value}</p>
    </div>
  );
}

/**
 * Chapter 3 Prompt 3 §15/§17 — the unit's real `Sale` price breakdown,
 * kept visually distinct from the construction contribution plan (a
 * customer pays for the flat itself here, and separately contributes to
 * shared construction costs elsewhere — two different obligations).
 */
export function SalePriceBreakdown({ sale }: { sale: Sale }) {
  const hasExtras = !!(sale.floorPremium?.amount || sale.parkingPrice?.amount || sale.additionalCharges?.amount);
  const hasDiscount = !!sale.discountAmount?.amount;

  return (
    <div className="border-border divide-border divide-y rounded-xl border px-5">
      <Row label="Base Price" value={formatBDT(sale.basePrice.amount)} muted={hasExtras || hasDiscount} />
      {!!sale.floorPremium?.amount && <Row label="Floor Premium" value={formatBDT(sale.floorPremium.amount)} muted />}
      {!!sale.parkingPrice?.amount && <Row label="Parking" value={formatBDT(sale.parkingPrice.amount)} muted />}
      {!!sale.additionalCharges?.amount && <Row label="Additional Charges" value={formatBDT(sale.additionalCharges.amount)} muted />}
      {hasDiscount && (
        <Row
          label={sale.discountReason ? `Discount — ${sale.discountReason}` : "Discount"}
          value={`− ${formatBDT(sale.discountAmount!.amount)}`}
          muted
        />
      )}
      <Row label="Sale Price" value={formatBDT(sale.salePrice.amount)} />
    </div>
  );
}
