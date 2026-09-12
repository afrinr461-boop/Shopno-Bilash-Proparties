import type { ID } from "../common";
import type { FinancialRecordBase } from "./base";

/** A capital contribution made by a shareholder into a project. */
export interface ShareholderContribution extends FinancialRecordBase {
  shareholderId: ID;
  shareholdingId: ID;
}

/** A distribution/payout made to a shareholder. */
export interface ShareholderPayment extends FinancialRecordBase {
  shareholderId: ID;
  shareholdingId: ID;
  note?: string;
}
