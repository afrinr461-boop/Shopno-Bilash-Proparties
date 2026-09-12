import type { AuditFields, ID, Money } from "./common";

export type LifecycleStatus = "active" | "inactive";

/** A material supplier — kept as `Vendor` for continuity with the earlier chapter that built it, extended with the fuller supplier profile Prompt 4 asks for. */
export interface Vendor extends AuditFields {
  id: ID;
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  /** Free text — trade licence/registration/bank details, whatever's relevant; not a structured KYC form. */
  businessInfo?: string;
  categories: string[];
  notes?: string;
  /** Absent on rows created before this field existed = "active" (see `resolveLifecycleStatus`). */
  status?: LifecycleStatus;
}

/**
 * Material categories are seed data, not a fixed enum — admins can add
 * categories, so this stays a plain string reference to a `MaterialCategory`
 * record rather than a union type.
 */
export interface MaterialCategory extends Partial<AuditFields> {
  id: ID;
  name: string;
  description?: string;
  /** A suggested unit for products in this category (e.g. "Bag" for Cement) — each `Material` still sets its own `unit`, this is only a form-fill convenience. */
  defaultUnit?: string;
  status?: LifecycleStatus;
}

/**
 * The purchasable, stockable leaf — a specific branded product inside a
 * category (e.g. "Shah Cement OPC", not just "Cement"). Deliberately NOT
 * merged with `MaterialCategory`: the brief is explicit that "Cement" and
 * "Brand A Cement" are different concepts, and this hierarchy already keeps
 * them separate (`categoryId` links up, this row is the specific product).
 */
export interface Material extends Partial<AuditFields> {
  id: ID;
  name: string;
  categoryId: ID;
  unit: string; // e.g. "bag", "ton", "sqft"
  brand?: string;
  specification?: string;
  grade?: string;
  description?: string;
  /**
   * A reference price only, shown as a form-fill hint — NEVER the source of
   * truth for what was actually paid. Every `Purchase` stores its own real
   * `unitPrice` at the time of that transaction; this field is never read
   * by any cost calculation.
   */
  defaultPrice?: Money;
  notes?: string;
  status?: LifecycleStatus;
}

export type PaymentStatus = "unpaid" | "partially-paid" | "paid";
/** Kept for the unused `PurchaseOrder` type below — `Purchase`'s own receiving state is derived from `PurchaseReceipt` rows instead, see `getPurchaseReceivingState` in `src/lib/materialStock.ts`. */
export type DeliveryStatus = "pending" | "partial" | "delivered";

export interface PurchaseOrderLine {
  materialId: ID;
  quantity: number;
  unitPrice: Money;
  taxPercentage?: number;
}

/** Never created by any action today — see `src/features/procurement/repository.ts`'s own note. Left in place, unused; `Purchase` itself is now the real one-material-per-transaction record. */
export interface PurchaseOrder extends AuditFields {
  id: ID;
  projectId: ID;
  vendorId: ID;
  lines: PurchaseOrderLine[];
  deliveryStatus: DeliveryStatus;
  attachmentDocumentIds: ID[];
}

export type PurchaseStatus = "ordered" | "cancelled";

/**
 * One material's purchase transaction — deliberately one material per
 * `Purchase` row (matching the brief's own field list, which describes
 * Project/Supplier/Material/Quantity/Unit Price/Total as flat fields on a
 * single purchase, not nested line items). Buying several materials in one
 * supplier visit means several `Purchase` rows, not one row with a list.
 *
 * `status` only ever stores "ordered" or "cancelled" — "Partially Received"
 * / "Fully Received" are *derived* at read time from this purchase's
 * `PurchaseReceipt` rows (see `getPurchaseReceivingState`), never stored,
 * so they can never drift from the real receiving history.
 */
export interface Purchase extends AuditFields {
  id: ID;
  purchaseOrderId?: ID;
  projectId: ID;
  vendorId: ID;
  /**
   * `materialId`/`quantity`/`unit`/`unitPrice`/`purchaseDate` are absent on
   * a handful of real purchases recorded before this per-material shape
   * existed (that older Purchase was invoice-level only, no material
   * breakdown) — every new purchase always sets all five, but read paths
   * must treat their absence as "a legacy invoice-only record" and degrade
   * to showing only what it actually has, never crash and never fabricate
   * the missing quantity/material.
   */
  materialId?: ID;
  quantity?: number;
  /** Snapshot of `Material.unit` at purchase time — survives a later unit-of-measure edit on the Material record. */
  unit?: string;
  unitPrice?: Money;
  /** Always `quantity * unitPrice.amount`, computed server-side — never independently editable. */
  total: Money;
  purchaseDate?: string;
  invoiceNumber?: string;
  /** A separate PO/reference number, distinct from the supplier's own invoice number. */
  referenceNumber?: string;
  paymentStatus: PaymentStatus;
  /** Absent on rows created before this field existed = "ordered". */
  status?: PurchaseStatus;
  /** Optional tag to the construction phase this purchase was for — the traceability model Chapter 2 Prompt 5's cost tracking reads directly, no separate valuation math. */
  constructionPhaseId?: ID;
  notes?: string;
  attachmentDocumentIds: ID[];
}

/**
 * The physical receipt of goods against a `Purchase` — separate from the
 * purchase itself because a purchase may be ordered in full and arrive in
 * parts. Only the quantity actually received here ever becomes a
 * `StockMovement`/physical stock; the ordered `Purchase.quantity` never
 * does on its own.
 */
export interface PurchaseReceipt extends AuditFields {
  id: ID;
  purchaseId: ID;
  projectId: ID;
  materialId: ID;
  vendorId: ID;
  receivedDate: string;
  quantityReceived: number;
  batchNumber?: string;
  deliveryNote?: string;
  notes?: string;
}

/**
 * "opening"/"received" add to stock, "used"/"wastage" remove from it —
 * `quantity` is always entered positive for those four (the type says the
 * direction). "adjustment" is the one type that can go either way (a stock
 * count correction), so its `quantity` may be negative.
 */
export type StockMovementType = "opening" | "received" | "used" | "wastage" | "adjustment";

/**
 * A single entry in a material's stock ledger for one project — current
 * stock is never stored, only ever computed by summing these (see
 * `src/lib/materialStock.ts`), the same "derive at read time, never a
 * stale stored field" approach already used for cost-allocation
 * contribution status.
 *
 * The construction-context fields are optional and only ever meaningful for
 * "used"/"wastage" movements — a movement is never required to carry a
 * Building/Floor/Unit, since some activities (e.g. site-wide overhead) have
 * no single location. `activity` is a free-text fallback for usage that
 * doesn't map to a formal `ConstructionPhase`.
 */
export interface StockMovement extends AuditFields {
  id: ID;
  projectId: ID;
  materialId: ID;
  type: StockMovementType;
  quantity: number;
  date: string;
  reference?: string;
  notes?: string;
  /** Set automatically when this movement was created by `recordPurchaseReceipt` — never set from the manual Stock Movement form. */
  purchaseId?: ID;
  buildingId?: ID;
  floorId?: ID;
  unitId?: ID;
  constructionPhaseId?: ID;
  activity?: string;
  contractorTeam?: string;
}

/**
 * A configurable low-stock trigger — one row per project+material pair,
 * since what counts as "low" for a small project can be normal for a large
 * one. Absence of a row for a project+material pair means no threshold is
 * configured (never treated as "always low" or "never low" by default).
 */
export interface MaterialThreshold extends AuditFields {
  id: ID;
  projectId: ID;
  materialId: ID;
  minimumStock: number;
}
