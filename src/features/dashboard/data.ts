import { projectRepository } from "@/features/projects/repository";
import { unitRepository } from "@/features/units/repository";
import { parkingRepository } from "@/features/parking/repository";
import { saleRepository } from "@/features/sales/repository";
import { milestoneRepository, constructionTaskRepository } from "@/features/construction/repository";
import { purchaseRepository, stockMovementRepository } from "@/features/procurement/repository";
import { documentRepository } from "@/features/documents/repository";
import { auditLogRepository } from "@/features/audit/repository";
import { ownershipRecordRepository } from "@/features/ownership/repository";
import { getProjectWorkspaceStats } from "@/features/projects/workspaceStats";
import { getSalesDashboard } from "@/features/sales/dashboardData";
import { computeSystemAlerts, summarizeAlerts } from "@/features/alerts/engine";
import { deriveScheduleDelay } from "@/lib/constructionProgress";
import { computeContributionState } from "@/lib/contributionStatus";
import {
  costAllocationRepository,
  ownerContributionRepository,
  contributionAdjustmentRepository,
} from "@/features/costAllocations/repository";
import { canAccessProjectOptional, filterToVisibleProjects, filterVisibleProjectsList } from "@/lib/projectScope";
import type { DashboardData, DashboardMetric } from "./types";
import type { AuditLog } from "@/types/audit-log";
import type { User } from "@/types/user";

function metric(value: number | null): DashboardMetric {
  return { value };
}

/**
 * Prompt 10 — ONE global, company-wide dashboard. Almost every number
 * here is a sum over the SAME per-project computation every Project
 * Workspace already uses (`getProjectWorkspaceStats`), plus the Sales
 * Dashboard (Prompt 8) and Alert Engine (Prompt 9) — this file adds no new
 * financial/construction logic of its own, it only aggregates what
 * already exists company-wide. Scoped to `user`'s visible projects
 * throughout, same as every per-project view.
 */
export async function getDashboardData(user: User): Promise<DashboardData> {
  const [
    allProjects,
    allUnits,
    allParking,
    allSales,
    allMilestones,
    allTasks,
    allPurchases,
    allMovements,
    allDocuments,
    ownershipRecords,
    salesDashboard,
    alerts,
  ] = await Promise.all([
    projectRepository.list(),
    unitRepository.list(),
    parkingRepository.list(),
    saleRepository.list(),
    milestoneRepository.list(),
    constructionTaskRepository.list(),
    purchaseRepository.list(),
    stockMovementRepository.list(),
    documentRepository.list(),
    ownershipRecordRepository.list(),
    getSalesDashboard(user),
    computeSystemAlerts(user),
  ]);

  const [allAllocations, allContributions, allAdjustments] = await Promise.all([
    costAllocationRepository.list(),
    ownerContributionRepository.list(),
    contributionAdjustmentRepository.list(),
  ]);

  const projects = filterVisibleProjectsList(user, allProjects);
  const units = filterToVisibleProjects(user, allUnits);
  const parking = filterToVisibleProjects(user, allParking);
  const sales = allSales.filter((s) => canAccessProjectOptional(user, s.projectId));
  const milestones = filterToVisibleProjects(user, allMilestones);
  const tasks = filterToVisibleProjects(user, allTasks);
  const purchases = filterToVisibleProjects(user, allPurchases);
  const movements = filterToVisibleProjects(user, allMovements);

  const perProject = await Promise.all(projects.map((p) => getProjectWorkspaceStats(p.id)));

  const sum = (fn: (s: (typeof perProject)[number]) => number) => perProject.reduce((s, stat) => s + fn(stat), 0);
  const avg = (fn: (s: (typeof perProject)[number]) => number | null) => {
    const values = perProject.map(fn).filter((v): v is number => v !== null);
    return values.length === 0 ? null : Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  };

  const activeProjects = projects.filter((p) => p.status === "ongoing" || p.status === "ready").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;

  const assignedUnits = units.length - sum((s) => s.unitsByStatus.available ?? 0);
  const visibleOwnershipRecords = filterToVisibleProjects(user, ownershipRecords);
  const totalOwnerIds = new Set(visibleOwnershipRecords.filter((r) => !r.endDate).map((r) => `${r.ownerType}:${r.ownerId}`));

  const assignedParking = parking.filter((p) => p.status !== "available").length;

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingMilestones = milestones.filter(
    (m) => m.status === "upcoming" && m.targetDate && new Date(m.targetDate) >= now && new Date(m.targetDate) <= in30Days,
  ).length;
  const overdueTasks = tasks.filter((t) => deriveScheduleDelay(t.endDate, t.completionDate, t.status).isDelayed).length;

  const completedSalesCount = sales.filter((s) => s.status === "completed").length;

  // Overdue amount specifically — distinct from `contributionsOutstanding` (every
  // unpaid contribution, overdue or not). Reuses `computeContributionState`, the
  // same derive-at-read-time function every other overdue check in this app uses.
  const visibleContributions = filterToVisibleProjects(user, allContributions);
  const allocationsById = new Map(allAllocations.map((a) => [a.id, a]));
  const adjustmentsByContribution = new Map<string, typeof allAdjustments>();
  for (const adj of allAdjustments) {
    const list = adjustmentsByContribution.get(adj.contributionId) ?? [];
    list.push(adj);
    adjustmentsByContribution.set(adj.contributionId, list);
  }
  let overdueAmount = 0;
  for (const contribution of visibleContributions) {
    const allocation = allocationsById.get(contribution.costAllocationId);
    if (!allocation) continue;
    const state = computeContributionState(contribution, allocation, adjustmentsByContribution.get(contribution.id) ?? []);
    if (state.status === "overdue") overdueAmount += state.totalDue;
  }

  const recentCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentPurchases = purchases.filter((p) => (p.purchaseDate ?? p.createdAt) >= recentCutoff && p.status !== "cancelled").length;
  const recentUsage = movements.filter((m) => m.type === "used" && m.date >= recentCutoff).length;

  const totalDocuments = allDocuments.length;
  const alertSummary = summarizeAlerts(alerts);
  const documentAlerts = alerts.filter((a) => a.category === "document");

  return {
    totalProjects: metric(projects.length),
    activeProjects: metric(activeProjects),
    completedProjects: metric(completedProjects),
    totalUnits: metric(units.length),
    assignedUnits: metric(Math.max(0, assignedUnits)),
    availableUnits: metric(sum((s) => s.unitsByStatus.available ?? 0)),
    totalOwners: metric(totalOwnerIds.size),
    totalParking: metric(parking.length),
    assignedParking: metric(assignedParking),

    expectedCollections: metric(sum((s) => s.contributionsPayable)),
    collected: metric(sum((s) => s.contributionsPaid)),
    outstanding: metric(sum((s) => s.contributionsOutstanding)),
    overdueAmount: metric(Math.round(overdueAmount)),
    projectExpenses: metric(sum((s) => s.costSummary.otherExpenseCost)),
    materialCost: metric(sum((s) => s.costSummary.materialCost)),
    contractorCost: metric(sum((s) => s.costSummary.contractorCost)),
    totalBudget: metric(sum((s) => s.costSummary.budgeted)),
    actualCost: metric(sum((s) => s.costSummary.actualCost)),

    constructionActiveProjects: metric(projects.filter((p) => p.status === "ongoing").length),
    averageConstructionProgress: metric(avg((s) => s.averageConstructionProgress)),
    delayedPhases: metric(sum((s) => s.delayedPhaseCount)),
    upcomingMilestones: metric(upcomingMilestones),
    overdueTasks: metric(overdueTasks),

    leads: metric(salesDashboard.activeLeads),
    activeBookings: metric(salesDashboard.activeBookings),
    completedSales: metric(completedSalesCount),
    pendingSales: metric(salesDashboard.pendingSales),
    salesValue: metric(salesDashboard.totalSalesValue),

    lowStockMaterials: metric(sum((s) => s.lowStockMaterialCount)),
    outOfStockMaterials: metric(alerts.filter((a) => a.id.startsWith("material-out:")).length),
    recentPurchases: metric(recentPurchases),
    recentUsage: metric(recentUsage),

    totalDocuments: metric(totalDocuments),
    documentsExpiringSoon: metric(documentAlerts.filter((a) => a.title === "Document expires soon").length),
    documentsExpired: metric(documentAlerts.filter((a) => a.title === "Document expired").length),

    criticalAlerts: metric(alertSummary.critical),
    highAlerts: metric(alertSummary.high),
    mediumAlerts: metric(alertSummary.medium),
    lowAlerts: metric(alertSummary.low),
  };
}

const ACTIVITY_LIMIT = 8;

/** Real activity only — sourced from the append-only audit log (Admin Step 3), never generated. */
export async function getRecentActivity(): Promise<AuditLog[]> {
  const entries = await auditLogRepository.list();
  return [...entries]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, ACTIVITY_LIMIT);
}
