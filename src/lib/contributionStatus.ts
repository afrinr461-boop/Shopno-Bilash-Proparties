import type {
  CostAllocation,
  ContributionAdjustment,
  OwnerContribution,
  GoalInstallment,
  OwnerInstallmentObligation,
} from "@/types/finance/costAllocation";

export type ContributionStatus = "paid" | "partially-paid" | "pending" | "overdue";

export interface ContributionState {
  /** payableAmount + sum(adjustments) — never persisted, the original payableAmount is never mutated. */
  effectivePayable: number;
  outstanding: number;
  isOverdue: boolean;
  fineAmount: number;
  /** outstanding + fineAmount — what actually needs to be paid to close this contribution out. */
  totalDue: number;
  status: ContributionStatus;
}

/**
 * Derives a contribution's status/fine/outstanding at read time — never
 * stored. `Installment.status` elsewhere in this codebase is a manually-set
 * dropdown value that can silently go stale; this is the fix for that
 * pattern applied to owner contributions, since there's no cron/scheduled
 * job anywhere in this app to keep a stored status field fresh.
 *
 * `adjustments` is additive/optional (defaults to `[]`) — every call site
 * written before `ContributionAdjustment` existed keeps compiling and
 * behaving identically.
 */
export function computeContributionState(
  contribution: OwnerContribution,
  allocation: CostAllocation,
  adjustments: ContributionAdjustment[] = [],
  today: Date = new Date(),
): ContributionState {
  const effectivePayable = contribution.payableAmount.amount + adjustments.reduce((s, a) => s + a.amount.amount, 0);
  const outstanding = Math.max(0, effectivePayable - contribution.paidAmount.amount);
  const isOverdue = outstanding > 0 && new Date(contribution.dueDate) < today;

  const fineAmount = isOverdue
    ? allocation.fineType === "flat"
      ? allocation.fineValue
      : outstanding * (allocation.fineValue / 100)
    : 0;

  const status: ContributionStatus =
    outstanding <= 0 ? "paid" : isOverdue ? "overdue" : contribution.paidAmount.amount > 0 ? "partially-paid" : "pending";

  return { effectivePayable, outstanding, isOverdue, fineAmount, totalDue: outstanding + fineAmount, status };
}

export type InstallmentObligationStatus = "upcoming" | "due" | "paid" | "partially-paid" | "overdue";

export interface InstallmentObligationState {
  outstanding: number;
  status: InstallmentObligationStatus;
}

/** Same derive-at-read-time convention as `computeContributionState`, applied to one owner's slice of one GoalInstallment. */
export function computeInstallmentObligationState(
  obligation: OwnerInstallmentObligation,
  installment: GoalInstallment,
  paidAmount: number,
  today: Date = new Date(),
): InstallmentObligationState {
  const outstanding = Math.max(0, obligation.payableAmount.amount - paidAmount);
  const dueDate = new Date(installment.dueDate);
  const daysUntilDue = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  let status: InstallmentObligationStatus;
  if (outstanding <= 0) status = "paid";
  else if (dueDate < today) status = "overdue";
  else if (paidAmount > 0) status = "partially-paid";
  else if (daysUntilDue <= 7) status = "due";
  else status = "upcoming";

  return { outstanding, status };
}

export type GoalCollectionStatus =
  | "draft"
  | "cancelled"
  | "archived"
  | "upcoming"
  | "active"
  | "partially-funded"
  | "fully-funded"
  | "completed";

/**
 * Derives a Construction Goal's lifecycle status from its workflow `status`
 * (draft|generated|cancelled — the field that actually gates what actions
 * are allowed) plus dates and live collection % — never stored itself.
 * Rule order: cancelled/archived short-circuit first (an Admin's explicit
 * decision always wins), then draft, then the collection-driven states,
 * with "completed" requiring both 100% collection AND the explicit
 * `completedAt` action (reaching 100% alone is "fully-funded", not
 * "completed" — closing the books out is a deliberate Admin step).
 */
export function deriveGoalCollectionStatus(
  allocation: CostAllocation,
  collectionPercent: number,
  today: Date = new Date(),
): GoalCollectionStatus {
  if (allocation.status === "cancelled") return "cancelled";
  if (allocation.archivedAt) return "archived";
  if (allocation.status === "draft") return "draft";

  if (collectionPercent >= 100 && allocation.completedAt) return "completed";
  if (collectionPercent >= 100) return "fully-funded";
  if (collectionPercent > 0) return "partially-funded";
  if (new Date(allocation.allocationDate) > today) return "upcoming";
  return "active";
}
