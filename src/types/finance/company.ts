import type { FinancialRecordBase } from "./base";

/** Company-level income not tied to a single project's cost ledger. */
export type CompanyIncome = FinancialRecordBase;

/** Company-level operating expense (overhead, salaries, rent, etc.). */
export type CompanyExpense = FinancialRecordBase;

export interface CompanyAdjustment extends FinancialRecordBase {
  reason: string;
  /** Positive = credit, negative = debit. */
  signedAmount: number;
}
