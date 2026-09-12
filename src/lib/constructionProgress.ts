import type { ConstructionPhase, ConstructionTask, Milestone, ProgressTrackingMethod } from "@/types/construction";
import type { Purchase } from "@/types/procurement";
import type { ProjectExpense } from "@/types/finance/project";
import type { ContractorPayment } from "@/types/contractor";

/**
 * The effective progress for a phase, given its `trackingMethod`. "manual"
 * (the only mode that ever existed before this pass) just returns the
 * stored `progressPercentage` unchanged. The other three derive a number
 * from real data every time — never stored, same derive-at-read-time
 * convention as `computeContributionState`/`summarizeStock`.
 */
export function derivePhaseProgress(phase: ConstructionPhase, phaseTasks: ConstructionTask[], phaseMilestones: Milestone[]): number {
  const method: ProgressTrackingMethod = phase.trackingMethod ?? "manual";

  if (method === "quantity") {
    const planned = phase.quantityPlanned ?? 0;
    const completed = phase.quantityCompleted ?? 0;
    return planned > 0 ? Math.round((100 * Math.min(completed, planned)) / planned) : 0;
  }

  if (method === "task") {
    if (phaseTasks.length === 0) return 0;
    const completed = phaseTasks.filter((t) => t.status === "completed").length;
    return Math.round((100 * completed) / phaseTasks.length);
  }

  if (method === "milestone") {
    if (phaseMilestones.length === 0) return 0;
    const completed = phaseMilestones.filter((m) => m.status === "completed").length;
    return Math.round((100 * completed) / phaseMilestones.length);
  }

  return phase.progressPercentage;
}

/**
 * Weighted overall progress is opt-in: only activates when EVERY phase in
 * the project has a `weight` set. Otherwise falls back to the exact flat
 * average `getProjectWorkspaceStats` always computed — zero behavior
 * change for any project that never configures weights.
 */
export function computeOverallProgress(
  phases: ConstructionPhase[],
  effectiveProgressOf: (phase: ConstructionPhase) => number = (p) => p.progressPercentage,
): { progress: number | null; method: "weighted" | "average" } {
  if (phases.length === 0) return { progress: null, method: "average" };

  const allWeighted = phases.every((p) => p.weight !== undefined && p.weight > 0);
  if (allWeighted) {
    const totalWeight = phases.reduce((s, p) => s + (p.weight ?? 0), 0);
    const weightedSum = phases.reduce((s, p) => s + effectiveProgressOf(p) * (p.weight ?? 0), 0);
    return { progress: totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0, method: "weighted" };
  }

  const average = Math.round(phases.reduce((s, p) => s + effectiveProgressOf(p), 0) / phases.length);
  return { progress: average, method: "average" };
}

/** Progress scoped to a Building/Floor/Unit — phases with no scope set are project-wide and count toward every scope; phases scoped elsewhere are excluded. */
export function computeScopedProgress(
  phases: ConstructionPhase[],
  scope: { buildingId?: string; floorId?: string; unitId?: string },
): { progress: number | null; method: "weighted" | "average" } {
  const inScope = phases.filter((p) => {
    if (scope.unitId && p.unitId && p.unitId !== scope.unitId) return false;
    if (scope.floorId && p.floorId && p.floorId !== scope.floorId) return false;
    if (scope.buildingId && p.buildingId && p.buildingId !== scope.buildingId) return false;
    if (scope.unitId) return p.unitId === scope.unitId || (!p.floorId && !p.buildingId && !p.unitId);
    if (scope.floorId) return p.floorId === scope.floorId || (!p.floorId && !p.buildingId);
    if (scope.buildingId) return p.buildingId === scope.buildingId || !p.buildingId;
    return true;
  });
  return computeOverallProgress(inScope);
}

export interface ScheduleDelayInfo {
  isDelayed: boolean;
  daysDelayed: number;
}

/**
 * Derived, never stored redundantly — a phase/task is "delayed" here purely
 * from comparing today against its CURRENT target date (kept live by
 * `reviseSchedule`) when it isn't finished/cancelled yet. This is additive
 * to the stored `status` enum (an admin can still separately mark
 * something "Delayed"), not a replacement for it.
 */
export function deriveScheduleDelay(
  targetDate: string | undefined,
  actualCompletionDate: string | undefined,
  storedStatus: string,
  today: Date = new Date(),
): ScheduleDelayInfo {
  if (!targetDate || storedStatus === "completed" || storedStatus === "cancelled" || actualCompletionDate) {
    return { isDelayed: false, daysDelayed: 0 };
  }
  const target = new Date(targetDate);
  const diffMs = today.getTime() - target.getTime();
  const daysDelayed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return { isDelayed: daysDelayed > 0, daysDelayed: Math.max(0, daysDelayed) };
}

/** Whether a phase/task finished after its (current, at-the-time) target — "Completed Late" per the brief's own example. */
export function completedLate(targetDate: string | undefined, actualCompletionDate: string | undefined): boolean {
  if (!targetDate || !actualCompletionDate) return false;
  return new Date(actualCompletionDate).getTime() > new Date(targetDate).getTime();
}

export interface PhaseCostSummary {
  estimatedCost: number;
  materialCost: number;
  expenseCost: number;
  contractorCost: number;
  actualCost: number;
  variance: number;
  budgetStatus: "under" | "on" | "over" | "no-estimate";
}

/**
 * Real actual cost for one phase — a sum over three already-real
 * transaction sources (Purchases and ProjectExpenses tagged to this phase,
 * ContractorPayments recorded against it), never an invented valuation.
 * `purchases`/`expenses`/`payments` should already be scoped to the
 * phase's project by the caller; this only filters by the phase link.
 */
export function computePhaseActualCost(
  phase: ConstructionPhase,
  purchases: Purchase[],
  expenses: ProjectExpense[],
  payments: ContractorPayment[],
): PhaseCostSummary {
  const materialCost = purchases
    .filter((p) => p.constructionPhaseId === phase.id && p.status !== "cancelled")
    .reduce((s, p) => s + p.total.amount, 0);
  const expenseCost = expenses.filter((e) => e.constructionPhaseId === phase.id).reduce((s, e) => s + e.amount.amount, 0);
  const contractorCost = payments.filter((p) => p.phaseId === phase.id).reduce((s, p) => s + p.amount.amount, 0);
  const actualCost = materialCost + expenseCost + contractorCost;
  const estimatedCost = phase.estimatedCost?.amount ?? 0;

  let budgetStatus: PhaseCostSummary["budgetStatus"] = "no-estimate";
  if (phase.estimatedCost !== undefined) {
    const diff = actualCost - estimatedCost;
    const tolerance = estimatedCost * 0.02; // within 2% reads as "on budget" rather than a hair-trigger over/under
    budgetStatus = diff > tolerance ? "over" : diff < -tolerance ? "under" : "on";
  }

  return { estimatedCost, materialCost, expenseCost, contractorCost, actualCost, variance: actualCost - estimatedCost, budgetStatus };
}
