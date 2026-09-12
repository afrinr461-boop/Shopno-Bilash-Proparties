import {
  costAllocationRepository,
  ownerContributionRepository,
  contributionPaymentRepository,
  goalInstallmentRepository,
} from "@/features/costAllocations/repository";
import { filterToVisibleProjects } from "@/lib/projectScope";
import type { User } from "@/types/user";

export interface MonthlyCollectionRow {
  month: string; // "YYYY-MM"
  expected: number;
  collected: number;
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/**
 * A lightweight foundation, not a BI report: "expected" comes from
 * GoalInstallment due dates (falling back to the parent CostAllocation's
 * own due date for goals with no installment plan), "collected" comes from
 * real ContributionPayment dates. Scoped through the same
 * `filterToVisibleProjects` every other project-aware report uses.
 */
export async function getMonthlyCollectionSummary(
  user: User,
  projectId?: string,
  monthsBack = 6,
): Promise<MonthlyCollectionRow[]> {
  const [allAllocations, allContributions, allPayments, allInstallments] = await Promise.all([
    costAllocationRepository.list(),
    ownerContributionRepository.list(),
    contributionPaymentRepository.list(),
    goalInstallmentRepository.list(),
  ]);

  let allocations = filterToVisibleProjects(user, allAllocations);
  let contributions = filterToVisibleProjects(user, allContributions);
  let installments = filterToVisibleProjects(user, allInstallments);
  if (projectId) {
    allocations = allocations.filter((a) => a.projectId === projectId);
    contributions = contributions.filter((c) => c.projectId === projectId);
    installments = installments.filter((i) => i.projectId === projectId);
  }

  const visibleAllocationIds = new Set(allocations.map((a) => a.id));
  const visibleContributionIds = new Set(contributions.map((c) => c.id));
  const payments = allPayments.filter((p) => visibleContributionIds.has(p.contributionId));

  const months: string[] = [];
  const now = new Date();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const expectedByMonth = new Map<string, number>();
  const allocationsWithInstallments = new Set(installments.map((i) => i.costAllocationId));
  for (const installment of installments) {
    const contributionsForAllocation = contributions.filter((c) => c.costAllocationId === installment.costAllocationId);
    // Approximate "expected this month" for an installment as the sum of that allocation's contribution payables, split by installment count — a simple, disclosed estimate, not a precise per-owner-obligation sum (kept lightweight per the brief's own framing).
    const totalPayable = contributionsForAllocation.reduce((s, c) => s + c.payableAmount.amount, 0);
    const key = monthKey(installment.dueDate);
    expectedByMonth.set(key, (expectedByMonth.get(key) ?? 0) + totalPayable / Math.max(1, installments.filter((i) => i.costAllocationId === installment.costAllocationId).length));
  }
  for (const allocation of allocations) {
    if (allocationsWithInstallments.has(allocation.id) || !visibleAllocationIds.has(allocation.id)) continue;
    const totalPayable = contributions
      .filter((c) => c.costAllocationId === allocation.id)
      .reduce((s, c) => s + c.payableAmount.amount, 0);
    const key = monthKey(allocation.dueDate);
    expectedByMonth.set(key, (expectedByMonth.get(key) ?? 0) + totalPayable);
  }

  const collectedByMonth = new Map<string, number>();
  for (const payment of payments) {
    const key = monthKey(payment.date);
    collectedByMonth.set(key, (collectedByMonth.get(key) ?? 0) + payment.amount.amount);
  }

  return months.map((month) => ({
    month,
    expected: Math.round(expectedByMonth.get(month) ?? 0),
    collected: Math.round(collectedByMonth.get(month) ?? 0),
  }));
}
