import type { UnitStatus, UnitFacing } from "@/types/unit";
import type { OwnershipSource } from "@/types/ownership";

/**
 * Chapter 3 Prompt 2 §17/§35 — the owner portal never shows an owner a raw
 * internal status/enum value. This is deliberately separate from
 * `lib/status.ts`'s `STATUS_CONFIG` (the Admin Panel's own, correct,
 * internal-facing vocabulary) — a "sold" unit reads as "Owned" to the
 * person who owns it, not "Sold".
 */
export const OWNER_UNIT_STATUS_LABEL: Record<UnitStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  booked: "Booked",
  "under-agreement": "Under Agreement",
  sold: "Owned",
  transferred: "Ownership Transferred",
  allocated: "Allocated",
  "on-hold": "On Hold",
  unavailable: "Unavailable",
  "under-construction": "Under Construction",
  cancelled: "Cancelled",
};

export const OWNER_FACING_LABEL: Record<UnitFacing, string> = {
  north: "North",
  south: "South",
  east: "East",
  west: "West",
  "north-east": "North-East",
  "north-west": "North-West",
  "south-east": "South-East",
  "south-west": "South-West",
};

/** How this ownership span began — shown next to the ownership date, never as a raw enum. */
export const OWNERSHIP_SOURCE_LABEL: Record<OwnershipSource, string> = {
  sale: "Purchased",
  shareholding: "Shareholding allocation",
  "landowner-allocation": "Landowner allocation",
  transfer: "Ownership transfer",
  manual: "Assigned",
};

/** §12 — `ContributionPayment.method` / `CustomerPayment.method` share this exact vocabulary. */
export const OWNER_PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "Cash",
  "bank-transfer": "Bank Transfer",
  cheque: "Cheque",
  "mobile-banking": "Mobile Banking",
  card: "Card",
};

/** §15 — never shown as the raw `AdjustmentType` enum. */
export const OWNER_ADJUSTMENT_TYPE_LABEL: Record<string, string> = {
  discount: "Discount",
  waiver: "Waiver",
  "additional-charge": "Additional Charge",
  correction: "Correction",
  refund: "Refund",
};
