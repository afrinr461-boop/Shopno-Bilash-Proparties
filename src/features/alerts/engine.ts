import { costAllocationRepository, ownerContributionRepository, contributionAdjustmentRepository } from "@/features/costAllocations/repository";
import { projectExpenseRepository, projectBudgetRepository } from "@/features/finance/repository";
import { contractorPaymentRepository } from "@/features/contractors/repository";
import { constructionPhaseRepository, constructionTaskRepository, milestoneRepository } from "@/features/construction/repository";
import { materialRepository, materialThresholdRepository, stockMovementRepository } from "@/features/procurement/repository";
import { documentRepository } from "@/features/documents/repository";
import { bookingRepository, saleRepository } from "@/features/sales/repository";
import { leadRepository } from "@/features/crm/repository";
import { companySettingsRepository, COMPANY_SETTINGS_ID } from "@/features/settings/repository";
import { computeContributionState } from "@/lib/contributionStatus";
import { deriveScheduleDelay } from "@/lib/constructionProgress";
import { currentStockOf, isLowStock } from "@/lib/materialStock";
import { filterToVisibleProjects, canAccessProjectOptional } from "@/lib/projectScope";
import type { User } from "@/types/user";
import type { NotificationCategory, NotificationPriority } from "@/types/notification";

export interface SystemAlert {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  description: string;
  projectId?: string;
  href: string;
}

const PRIORITY_RANK: Record<NotificationPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

/**
 * Prompt 9 §3/§15 — the Smart Alert Engine. Every alert here is derived
 * live from real data through functions that already existed for their
 * own domain (`computeContributionState`, `deriveScheduleDelay`,
 * `isLowStock`) — nothing is a new source of truth, and nothing is
 * persisted: recomputed on every call, same "derive at read time, never
 * store what can be computed" convention this app already uses everywhere
 * else (`computeProjectActualCost`, `summarizeStock`, ...). Scoped to
 * `user`'s visible projects throughout.
 */
export async function computeSystemAlerts(user: User): Promise<SystemAlert[]> {
  const alerts: SystemAlert[] = [];
  const settings = await companySettingsRepository.findById(COMPANY_SETTINGS_ID).catch(() => null);
  const reminderLeadDays = settings?.reminderLeadDays ?? 7;
  const defaultLowStockThreshold = settings?.defaultLowStockThreshold;

  // ---- FINANCE ----
  const [allocations, contributions, adjustments] = await Promise.all([
    costAllocationRepository.list(),
    ownerContributionRepository.list(),
    contributionAdjustmentRepository.list(),
  ]);
  const visibleContributions = filterToVisibleProjects(user, contributions);
  const allocationsById = new Map(allocations.map((a) => [a.id, a]));
  const adjustmentsByContribution = new Map<string, typeof adjustments>();
  for (const adj of adjustments) {
    const list = adjustmentsByContribution.get(adj.contributionId) ?? [];
    list.push(adj);
    adjustmentsByContribution.set(adj.contributionId, list);
  }
  for (const contribution of visibleContributions) {
    const allocation = allocationsById.get(contribution.costAllocationId);
    if (!allocation) continue;
    const state = computeContributionState(contribution, allocation, adjustmentsByContribution.get(contribution.id) ?? []);
    if (state.status === "overdue") {
      alerts.push({
        id: `installment-overdue:${contribution.id}`,
        category: "finance",
        priority: "high",
        title: "Installment overdue",
        description: `${allocation.title} — ${Math.round(state.totalDue).toLocaleString()} BDT overdue.`,
        projectId: contribution.projectId,
        href: `/admin/finance/cost-allocations/${allocation.id}`,
      });
    } else if (state.status === "partially-paid") {
      alerts.push({
        id: `installment-partial:${contribution.id}`,
        category: "finance",
        priority: "medium",
        title: "Partial payment",
        description: `${allocation.title} — ${Math.round(state.outstanding).toLocaleString()} BDT still outstanding.`,
        projectId: contribution.projectId,
        href: `/admin/finance/cost-allocations/${allocation.id}`,
      });
    }
  }

  const [expenses, contractorPayments] = await Promise.all([projectExpenseRepository.list(), contractorPaymentRepository.list()]);
  for (const expense of filterToVisibleProjects(user, expenses)) {
    if (expense.status === "pending" || expense.status === "submitted") {
      alerts.push({
        id: `expense-verify:${expense.id}`,
        category: "finance",
        priority: "medium",
        title: "Expense requires verification",
        description: `${expense.description} — ${expense.amount.amount.toLocaleString()} BDT.`,
        projectId: expense.projectId,
        href: `/admin/finance/expenses/${expense.id}`,
      });
    }
  }
  for (const payment of contractorPayments.filter((p) => canAccessProjectOptional(user, p.projectId))) {
    if (payment.status === "pending" || payment.status === "submitted") {
      alerts.push({
        id: `payment-verify:${payment.id}`,
        category: "finance",
        priority: "medium",
        title: "Payment verification required",
        description: `Contractor payment — ${payment.amount.amount.toLocaleString()} BDT awaiting verification.`,
        projectId: payment.projectId,
        href: "/admin/approvals",
      });
    }
  }

  const budgets = filterToVisibleProjects(user, await projectBudgetRepository.list());
  for (const budget of budgets) {
    if (budget.budgeted.amount <= 0) continue;
    const utilizationPct = (100 * budget.actual.amount) / budget.budgeted.amount;
    const overThresholdPct = budget.overThresholdPct ?? 100;
    if (utilizationPct >= overThresholdPct) {
      alerts.push({
        id: `budget-over:${budget.id}`,
        category: "finance",
        priority: "high",
        title: "Budget exceeded",
        description: `${budget.category} — ${Math.round(utilizationPct)}% of budget used.`,
        projectId: budget.projectId,
        href: `/admin/finance/project-costs/${budget.id}`,
      });
    }
  }

  // ---- CONSTRUCTION ----
  const [phases, tasks, milestones] = await Promise.all([
    constructionPhaseRepository.list(),
    constructionTaskRepository.list(),
    milestoneRepository.list(),
  ]);
  for (const phase of filterToVisibleProjects(user, phases)) {
    const delay = deriveScheduleDelay(phase.endDate, phase.actualEndDate, phase.status);
    if (delay.isDelayed) {
      alerts.push({
        id: `phase-delayed:${phase.id}`,
        category: "construction",
        priority: delay.daysDelayed > 14 ? "critical" : "high",
        title: "Construction stage delayed",
        description: `${phase.name} — ${delay.daysDelayed} day${delay.daysDelayed === 1 ? "" : "s"} behind schedule.`,
        projectId: phase.projectId,
        href: `/admin/construction/${phase.id}`,
      });
    }
  }
  for (const task of filterToVisibleProjects(user, tasks)) {
    const delay = deriveScheduleDelay(task.endDate, task.completionDate, task.status);
    if (delay.isDelayed) {
      alerts.push({
        id: `task-overdue:${task.id}`,
        category: "construction",
        priority: delay.daysDelayed > 7 ? "high" : "medium",
        title: "Task overdue",
        description: `${task.title} — ${delay.daysDelayed} day${delay.daysDelayed === 1 ? "" : "s"} overdue.`,
        projectId: task.projectId,
        href: `/admin/construction/${task.phaseId}`,
      });
    }
  }
  for (const milestone of filterToVisibleProjects(user, milestones)) {
    const delay = deriveScheduleDelay(milestone.targetDate, milestone.completedDate, milestone.status);
    if (delay.isDelayed) {
      alerts.push({
        id: `milestone-missed:${milestone.id}`,
        category: "construction",
        priority: "high",
        title: "Milestone missed",
        description: `${milestone.name} — ${delay.daysDelayed} day${delay.daysDelayed === 1 ? "" : "s"} past target.`,
        projectId: milestone.projectId,
        href: milestone.relatedPhaseId ? `/admin/construction/${milestone.relatedPhaseId}` : "/admin/construction",
      });
    }
  }

  // ---- INVENTORY ----
  // `Material` itself has no `projectId` (it's a global catalog entry) — project
  // context only exists on `StockMovement`/`MaterialThreshold` rows, so the set
  // of (project, material) pairs actually worth checking comes from those.
  const [materials, thresholds, allMovements] = await Promise.all([
    materialRepository.list(),
    materialThresholdRepository.list(),
    stockMovementRepository.list(),
  ]);
  const materialsById = new Map(materials.map((m) => [m.id, m]));
  const movements = filterToVisibleProjects(user, allMovements);
  const thresholdByKey = new Map(thresholds.map((t) => [`${t.projectId}:${t.materialId}`, t.minimumStock]));
  const materialProjectPairs = new Set(movements.map((m) => `${m.projectId}:${m.materialId}`));
  for (const key of materialProjectPairs) {
    const [projectId, materialId] = key.split(":");
    const material = materialsById.get(materialId);
    if (!material) continue;
    const pairMovements = movements.filter((m) => m.materialId === materialId && m.projectId === projectId);
    const stock = currentStockOf(pairMovements);
    const threshold = thresholdByKey.get(key) ?? defaultLowStockThreshold;
    if (stock <= 0) {
      alerts.push({
        id: `material-out:${key}`,
        category: "inventory",
        priority: "high",
        title: "Material out of stock",
        description: `${material.name} — 0 ${material.unit} remaining.`,
        projectId,
        href: `/admin/procurement/materials/${material.id}`,
      });
    } else if (isLowStock(stock, threshold)) {
      alerts.push({
        id: `material-low:${key}`,
        category: "inventory",
        priority: "medium",
        title: "Material stock running low",
        description: `${material.name} — ${stock} ${material.unit} left (below ${threshold}).`,
        projectId,
        href: `/admin/procurement/materials/${material.id}`,
      });
    }
  }

  // ---- DOCUMENTS ----
  const documents = await documentRepository.list();
  const now = new Date();
  const leadCutoff = new Date(now.getTime() + reminderLeadDays * 24 * 60 * 60 * 1000);
  for (const doc of documents) {
    if (!doc.expiryDate || doc.status === "archived") continue;
    const expiry = new Date(doc.expiryDate);
    if (expiry < now) {
      alerts.push({
        id: `document-expired:${doc.id}`,
        category: "document",
        priority: "high",
        title: "Document expired",
        description: `${doc.name} expired on ${doc.expiryDate.slice(0, 10)}.`,
        href: `/admin/documents/${doc.id}`,
      });
    } else if (expiry <= leadCutoff) {
      alerts.push({
        id: `document-expiring:${doc.id}`,
        category: "document",
        priority: "low",
        title: "Document expires soon",
        description: `${doc.name} expires on ${doc.expiryDate.slice(0, 10)}.`,
        href: `/admin/documents/${doc.id}`,
      });
    }
  }

  // ---- SALES ----
  const [bookings, sales] = await Promise.all([bookingRepository.list(), saleRepository.list()]);
  for (const booking of bookings.filter((b) => canAccessProjectOptional(user, b.projectId))) {
    if (!booking.expiryDate || (booking.status !== "reserved" && booking.status !== "booked" && booking.status !== "confirmed")) continue;
    const expiry = new Date(booking.expiryDate);
    if (expiry < now) {
      alerts.push({
        id: `booking-expired:${booking.id}`,
        category: "sales",
        priority: "high",
        title: "Booking expired",
        description: `Booking expired on ${booking.expiryDate.slice(0, 10)} — still marked active.`,
        projectId: booking.projectId,
        href: "/admin/sales/bookings",
      });
    } else if (expiry <= leadCutoff) {
      alerts.push({
        id: `booking-expiring:${booking.id}`,
        category: "sales",
        priority: "medium",
        title: "Booking expires soon",
        description: `Booking expires on ${booking.expiryDate.slice(0, 10)}.`,
        projectId: booking.projectId,
        href: "/admin/sales/bookings",
      });
    }
  }
  for (const sale of sales.filter((s) => canAccessProjectOptional(user, s.projectId))) {
    if (sale.status === "pending") {
      alerts.push({
        id: `sale-incomplete:${sale.id}`,
        category: "sales",
        priority: "medium",
        title: "Sale incomplete",
        description: `Sale ${sale.id.slice(0, 8)} is still pending confirmation.`,
        projectId: sale.projectId,
        href: `/admin/sales/${sale.id}`,
      });
    }
  }

  // ---- CRM ----
  const allLeads = await leadRepository.list();
  const leads = allLeads.filter((l) => canAccessProjectOptional(user, l.interestedProjectId));
  const todayStr = now.toISOString().slice(0, 10);
  const staleCutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  for (const lead of leads) {
    if (lead.status === "won" || lead.status === "lost") continue;
    if (lead.nextFollowUpAt) {
      const followUpDate = lead.nextFollowUpAt.slice(0, 10);
      if (followUpDate < todayStr) {
        alerts.push({
          id: `lead-followup-overdue:${lead.id}`,
          category: "crm",
          priority: "high",
          title: "Scheduled follow-up missed",
          description: `${lead.name} — follow-up was due ${followUpDate}.`,
          projectId: lead.interestedProjectId,
          href: `/admin/leads/${lead.id}`,
        });
      } else if (followUpDate === todayStr) {
        alerts.push({
          id: `lead-followup-today:${lead.id}`,
          category: "crm",
          priority: "medium",
          title: "New lead requires follow-up",
          description: `${lead.name} — follow-up due today.`,
          projectId: lead.interestedProjectId,
          href: `/admin/leads/${lead.id}`,
        });
      }
    } else if (lead.updatedAt < staleCutoff) {
      alerts.push({
        id: `lead-inactive:${lead.id}`,
        category: "crm",
        priority: "low",
        title: "Lead inactive for too long",
        description: `${lead.name} — no activity in over 14 days.`,
        projectId: lead.interestedProjectId,
        href: `/admin/leads/${lead.id}`,
      });
    }
  }

  return alerts.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}

export interface AlertSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export function summarizeAlerts(alerts: SystemAlert[]): AlertSummary {
  return {
    critical: alerts.filter((a) => a.priority === "critical").length,
    high: alerts.filter((a) => a.priority === "high").length,
    medium: alerts.filter((a) => a.priority === "medium").length,
    low: alerts.filter((a) => a.priority === "low").length,
    total: alerts.length,
  };
}
