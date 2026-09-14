import type { TransactionStatus } from "@/types/finance/base";

/**
 * Whether a `ProjectExpense`/`ContractorPayment` should count toward a real
 * "actual cost" total — per `TransactionStatus`'s own doc comment, only
 * "verified"/"completed" (or genuinely unset, for a row nobody has moved
 * through the approval workflow yet) should. Everything else — draft,
 * pending, submitted, rejected, cancelled — is money that either hasn't
 * been confirmed as real yet or was explicitly declined, and must not
 * inflate a phase/project's Actual Cost, Budget Status, or the company-wide
 * Reports totals. One shared predicate so every aggregator (construction
 * phase cost, project cost, Reports) applies the exact same rule instead of
 * each reimplementing (and potentially drifting from) it.
 */
export function countsTowardActualCost(status: TransactionStatus | undefined): boolean {
  return status === undefined || status === "verified" || status === "completed";
}
