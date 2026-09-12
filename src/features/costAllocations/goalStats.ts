import { computeContributionState } from "@/lib/contributionStatus";
import type { CostAllocation, OwnerContribution, ContributionAdjustment } from "@/types/finance/costAllocation";

export interface GoalCollectionStats {
  target: number;
  allocated: number;
  collected: number;
  outstanding: number;
  collectionPercent: number;
  ownerCounts: { fullyPaid: number; partial: number; unpaid: number };
}

/** Real numbers only — target/allocated/collected/outstanding for one Construction Goal, plus a per-owner status breakdown. */
export function computeGoalCollectionStats(
  allocation: CostAllocation,
  contributions: OwnerContribution[],
  adjustments: ContributionAdjustment[],
): GoalCollectionStats {
  const adjustmentsByContribution = new Map<string, ContributionAdjustment[]>();
  for (const adj of adjustments) {
    const list = adjustmentsByContribution.get(adj.contributionId) ?? [];
    list.push(adj);
    adjustmentsByContribution.set(adj.contributionId, list);
  }

  let allocated = 0;
  let collected = 0;
  let outstanding = 0;
  const ownerCounts = { fullyPaid: 0, partial: 0, unpaid: 0 };

  for (const contribution of contributions) {
    const state = computeContributionState(contribution, allocation, adjustmentsByContribution.get(contribution.id) ?? []);
    allocated += state.effectivePayable;
    collected += contribution.paidAmount.amount;
    outstanding += state.outstanding;

    if (state.status === "paid") ownerCounts.fullyPaid += 1;
    else if (contribution.paidAmount.amount > 0) ownerCounts.partial += 1;
    else ownerCounts.unpaid += 1;
  }

  const target = allocation.totalAmount.amount;
  const collectionPercent = allocated > 0 ? Math.round((100 * collected) / allocated) : 0;

  return { target, allocated, collected, outstanding, collectionPercent, ownerCounts };
}
