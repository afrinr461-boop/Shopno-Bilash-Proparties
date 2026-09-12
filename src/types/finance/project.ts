import type { ID, Money } from "../common";
import type { FinancialRecordBase, TransactionPaymentMethod, TransactionStatus, FinancialAdjustmentType } from "./base";

/**
 * Budget vs. actual cost tracking for a single project, optionally scoped
 * to one construction phase (`phaseId`) — a project-level line has no
 * `phaseId`. `warningThresholdPct`/`overThresholdPct` default to 80/100 at
 * the UI layer when absent (rows created before Prompt 6 have neither).
 */
export interface ProjectBudget extends FinancialRecordBase {
  projectId: ID;
  phaseId?: ID;
  budgeted: Money;
  actual: Money;
  warningThresholdPct?: number;
  overThresholdPct?: number;
}

export interface ProjectExpense extends FinancialRecordBase {
  projectId: ID;
  description: string;
  subcategory?: string;
  vendorId?: ID;
  /** Optional tag to the construction phase this expense was for — read directly by Chapter 2 Prompt 5's `computePhaseActualCost`, no duplicate expense record. */
  constructionPhaseId?: ID;
  /** Traceability tag only (e.g. "this misc cost was for contractor X's crew") — does NOT make this a `ContractorPayment`; actual contractor spend still lives exclusively in that repository, so nothing here is double-counted into contractor totals. */
  contractorId?: ID;
  buildingId?: ID;
  paymentMethod?: TransactionPaymentMethod;
  accountId?: ID;
  status?: TransactionStatus;
  attachmentIds?: ID[];
}

/**
 * A controlled, non-destructive correction against a real `ProjectExpense`
 * or `ContractorPayment` — mirrors `ContributionAdjustment`'s own pattern
 * (Prompt 3) one layer up: never mutates the original record's amount,
 * just adds a signed line next to it. `targetType`/`targetId` is a loose
 * polymorphic reference (two possible tables) rather than two optional FK
 * columns, since exactly one target ever applies.
 */
export interface FinancialAdjustment extends FinancialRecordBase {
  projectId: ID;
  targetType: "expense" | "contractorPayment";
  targetId: ID;
  type: FinancialAdjustmentType;
  reason: string;
}
