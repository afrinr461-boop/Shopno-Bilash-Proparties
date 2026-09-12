import type { AuditFields, ID, Money } from "../common";

/** Every method an expense/contractor payment can be settled through — Prompt 6's explicit list. Named distinctly from `finance/customer.ts`'s own `PaymentMethod` (CustomerPayment, an earlier step) and `costAllocation.ts`'s `ContributionPaymentMethod` (Prompt 3) so neither domain's working code is touched. */
export type TransactionPaymentMethod = "cash" | "bank-transfer" | "cheque" | "bkash" | "nagad" | "rocket" | "card" | "other";

/** Lifecycle of a recorded transaction — only "verified"/"completed" (or a role-specific equivalent) should count toward totals per business rule; the calling code decides which statuses are "final", this type just names the states. */
export type TransactionStatus = "draft" | "pending" | "submitted" | "verified" | "completed" | "cancelled" | "rejected";

/** Same vocabulary as `AdjustmentType` (`finance/costAllocation.ts`) plus "reversal"/"transfer" — kept as its own type so Prompt 3's owner-contribution adjustments stay untouched while Prompt 6's expense/contractor-payment corrections get the two extra kinds the brief asks for. */
export type FinancialAdjustmentType = "discount" | "waiver" | "additional-charge" | "refund" | "correction" | "reversal" | "transfer";

/**
 * Shared shape for every financial record, across all four finance domains
 * (project/customer/shareholder/company). The domains are still four
 * separate type hierarchies and, later, four separate tables/API
 * boundaries — this base only avoids repeating the common audit fields.
 * See ARCHITECTURE.md §6 Financial Domain Separation for why these are
 * never merged into one generic "transactions" table.
 */
export interface FinancialRecordBase extends AuditFields {
  id: ID;
  date: string;
  amount: Money;
  category: string;
  projectId?: ID;
  reference?: string;
}
