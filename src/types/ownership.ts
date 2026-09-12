import type { AuditFields, ID, Money } from "./common";
import type { OwnerType } from "./finance/costAllocation";

export type OwnershipTargetType = "unit" | "parking";
export type OwnershipSource = "sale" | "shareholding" | "landowner-allocation" | "transfer" | "manual";

/**
 * One row = one continuous ownership span for one target (a Unit or a
 * Parking space). `endDate` undefined means this span is still open — the
 * current owner. Assigning a new owner always closes the previous open
 * span before opening a new one; a row is never destructively edited, so
 * the full history survives every ownership change. This is the audit
 * trail underneath `Unit.customerId/shareholderId/landownerAllocationId`
 * (and `Parking.ownerType/ownerId`) — those fast-path fields stay the
 * source every existing guard/list/report already reads; this table adds
 * what they can't: history.
 */
export interface OwnershipRecord extends AuditFields {
  id: ID;
  targetType: OwnershipTargetType;
  targetId: ID;
  /** Denormalized for project-scoping, matching every other domain's convention. */
  projectId: ID;
  ownerType: OwnerType;
  ownerId: ID;
  /** What mechanism opened this span. */
  source: OwnershipSource;
  /** Sale.id / Shareholding.id / LandownerAllocation.id — undefined for "manual" (e.g. a direct Parking assignment with no backing transaction). */
  sourceRecordId?: ID;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export type ObligationHandling = "previous-pays" | "new-assumes" | "split" | "waived" | "adjusted" | "other";
export type OwnershipTransferStatus = "pending" | "approved" | "completed" | "rejected";

/**
 * Prompt 8 §7 — an explicit record for reassigning a unit's ownership
 * (e.g. a resale) without simply overwriting `OwnershipRecord`'s current
 * span. Approving/completing a transfer closes the old `OwnershipRecord`
 * span and opens a new one (`source: "manual"`, `sourceRecordId` pointing
 * back to this transfer's id) — the same "close then open" pattern every
 * other ownership change in this app already uses, never a destructive
 * overwrite.
 */
export interface OwnershipTransfer extends AuditFields {
  id: ID;
  unitId: ID;
  projectId: ID;
  previousOwnerType: OwnerType;
  previousOwnerId: ID;
  newOwnerType: OwnerType;
  newOwnerId: ID;
  date: string;
  reason: string;
  transferValue?: Money;
  obligationHandling: ObligationHandling;
  status: OwnershipTransferStatus;
}
