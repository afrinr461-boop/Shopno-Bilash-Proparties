import type { AuditFields, ID } from "../common";
import type { LifecycleStatus } from "../contractor";

export type CashAccountType = "cash" | "bank" | "mobile-banking";

/**
 * An internal cash/bank/mobile-money record Expenses and Contractor
 * Payments can be tagged against — not a real banking integration (Prompt
 * 6 §6 is explicit: "Do NOT create fake banking integrations"), just a
 * named place money is recorded as moving through, for balance-by-account
 * visibility.
 */
export interface CashAccount extends AuditFields {
  id: ID;
  name: string;
  type: CashAccountType;
  accountNumber?: string;
  bankName?: string;
  notes?: string;
  status: LifecycleStatus;
}
