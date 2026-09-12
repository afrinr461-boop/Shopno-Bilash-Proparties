import type { Purchase, PurchaseReceipt, StockMovement } from "@/types/procurement";

/** Signed contribution of one movement to current stock — see `StockMovement`'s own doc comment for the direction rule. */
function movementDelta(movement: StockMovement): number {
  switch (movement.type) {
    case "opening":
    case "received":
      return movement.quantity;
    case "used":
    case "wastage":
      return -movement.quantity;
    case "adjustment":
      return movement.quantity;
  }
}

export interface StockSummary {
  opening: number;
  received: number;
  used: number;
  wastage: number;
  adjustment: number;
  currentStock: number;
}

/**
 * Never stored — recomputed from the movement ledger every time, the same
 * derive-at-read-time approach `computeContributionState` uses for cost
 * allocations. `movements` should already be filtered to one material in
 * one project before calling this.
 */
export function summarizeStock(movements: StockMovement[]): StockSummary {
  const summary: StockSummary = { opening: 0, received: 0, used: 0, wastage: 0, adjustment: 0, currentStock: 0 };
  for (const m of movements) {
    if (m.type === "opening") summary.opening += m.quantity;
    else if (m.type === "received") summary.received += m.quantity;
    else if (m.type === "used") summary.used += m.quantity;
    else if (m.type === "wastage") summary.wastage += m.quantity;
    else if (m.type === "adjustment") summary.adjustment += m.quantity;
    summary.currentStock += movementDelta(m);
  }
  return summary;
}

/** Current stock only — the cheap check used before allowing a "used"/"wastage" movement, so a caller doesn't need the full summary shape just to guard against negative stock. */
export function currentStockOf(movements: StockMovement[]): number {
  return movements.reduce((sum, m) => sum + movementDelta(m), 0);
}

export interface LedgerRow {
  movement: StockMovement;
  before: number;
  after: number;
}

/**
 * The same movements, chronologically ordered, with a running before/after
 * balance attached to each — the audit-trail view the brief asks for
 * ("Date, Material, Project, Movement type, Quantity, Before balance,
 * Movement, After balance..."). Never stored, computed fresh from
 * `movements` every time, same as `summarizeStock`.
 */
export function buildLedger(movements: StockMovement[]): LedgerRow[] {
  const sorted = [...movements].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
  let running = 0;
  return sorted.map((movement) => {
    const before = running;
    running += movementDelta(movement);
    return { movement, before, after: running };
  });
}

/** A material/project pair is low on stock only when a threshold is actually configured for it — absence of a threshold is never treated as "low." */
export function isLowStock(currentStock: number, minimumStock: number | undefined): boolean {
  return minimumStock !== undefined && currentStock < minimumStock;
}

export type PurchaseReceivingStatus = "ordered" | "partially-received" | "fully-received" | "cancelled";

export interface PurchaseReceivingState {
  status: PurchaseReceivingStatus;
  receivedQuantity: number;
  remainingQuantity: number;
}

/**
 * Derived, never stored — `Purchase.status` only ever holds "ordered" or
 * "cancelled" (an explicit Admin action); the richer receiving state is
 * always computed fresh from the purchase's total received-so-far quantity
 * so it can never drift from the real receiving history.
 */
export function derivePurchaseReceivingState(purchase: Purchase, receivedQuantity: number): PurchaseReceivingState {
  const orderedQuantity = purchase.quantity ?? 0;
  const remainingQuantity = Math.max(0, orderedQuantity - receivedQuantity);

  if (purchase.status === "cancelled") return { status: "cancelled", receivedQuantity, remainingQuantity };
  if (receivedQuantity <= 0) return { status: "ordered", receivedQuantity, remainingQuantity };
  if (receivedQuantity >= orderedQuantity) return { status: "fully-received", receivedQuantity, remainingQuantity: 0 };
  return { status: "partially-received", receivedQuantity, remainingQuantity };
}

/** Convenience wrapper over `derivePurchaseReceivingState` for callers that already have the full `PurchaseReceipt[]` on hand. */
export function getPurchaseReceivingState(purchase: Purchase, receipts: PurchaseReceipt[]): PurchaseReceivingState {
  return derivePurchaseReceivingState(
    purchase,
    receipts.reduce((s, r) => s + r.quantityReceived, 0),
  );
}

export interface MaterialCostSummary {
  totalQuantityPurchased: number;
  totalPurchaseCost: number;
  averagePurchasePrice: number;
  latestPurchasePrice: number | undefined;
  latestPurchaseDate: string | undefined;
}

/**
 * Real purchase-history numbers for one material (optionally already scoped
 * to one project by the caller) — never fabricated, `purchases` should
 * exclude "cancelled" rows before calling this if only real spend matters.
 * A handful of real purchases predate the per-material shape and carry no
 * `quantity`/`purchaseDate`/`unitPrice` (see `Purchase`'s own doc comment)
 * — those contribute their real `total` to cost but 0 to quantity, and sort
 * last rather than crash or get silently dropped.
 */
export function summarizeMaterialCost(purchases: Purchase[]): MaterialCostSummary {
  const totalQuantityPurchased = purchases.reduce((s, p) => s + (p.quantity ?? 0), 0);
  const totalPurchaseCost = purchases.reduce((s, p) => s + p.total.amount, 0);
  const sorted = [...purchases].sort((a, b) => (b.purchaseDate ?? "").localeCompare(a.purchaseDate ?? ""));
  return {
    totalQuantityPurchased,
    totalPurchaseCost,
    averagePurchasePrice: totalQuantityPurchased > 0 ? totalPurchaseCost / totalQuantityPurchased : 0,
    latestPurchasePrice: sorted[0]?.unitPrice?.amount,
    latestPurchaseDate: sorted[0]?.purchaseDate,
  };
}
