import { unitRepository } from "@/features/units/repository";
import { projectRepository } from "@/features/projects/repository";
import { leadRepository } from "@/features/crm/repository";
import { saleRepository } from "@/features/sales/repository";
import { userRepository } from "@/features/users/repository";
import { filterToVisibleProjects, filterVisibleProjectsList, canAccessProjectOptional } from "@/lib/projectScope";
import type { User } from "@/types/user";
import type { UnitStatus } from "@/types/unit";
import type { LeadStatus } from "@/types/crm";

export interface UnitInventoryRow {
  projectId: string;
  projectName: string;
  total: number;
  byStatus: Partial<Record<UnitStatus, number>>;
}

/** Prompt 8 §11 — Unit Inventory Report: every unit's current status, grouped by project. */
export async function getUnitInventoryReport(user: User): Promise<UnitInventoryRow[]> {
  const [allUnits, allProjects] = await Promise.all([unitRepository.list(), projectRepository.list()]);
  const units = filterToVisibleProjects(user, allUnits);
  const projects = filterVisibleProjectsList(user, allProjects);
  const projectsById = new Map(projects.map((p) => [p.id, p]));

  const byProject = new Map<string, UnitInventoryRow>();
  for (const unit of units) {
    const project = projectsById.get(unit.projectId);
    if (!project) continue;
    const row = byProject.get(unit.projectId) ?? { projectId: unit.projectId, projectName: project.name, total: 0, byStatus: {} };
    row.total += 1;
    row.byStatus[unit.status] = (row.byStatus[unit.status] ?? 0) + 1;
    byProject.set(unit.projectId, row);
  }
  return [...byProject.values()].sort((a, b) => a.projectName.localeCompare(b.projectName));
}

const FUNNEL_STAGES: LeadStatus[] = ["new", "contacted", "qualified", "site-visit", "negotiation", "booking", "won"];

export interface LeadConversionReport {
  funnel: { status: LeadStatus; count: number }[];
  lostCount: number;
  totalLeads: number;
  conversionRatePct: number | null;
}

/** Prompt 8 §11 — Leads/Conversion Report: a simple funnel count per pipeline stage, plus overall win rate among closed leads. */
export async function getLeadConversionReport(user: User): Promise<LeadConversionReport> {
  const allLeads = await leadRepository.list();
  const leads = allLeads.filter((l) => canAccessProjectOptional(user, l.interestedProjectId));

  const funnel = FUNNEL_STAGES.map((status) => ({ status, count: leads.filter((l) => l.status === status).length }));
  const lostCount = leads.filter((l) => l.status === "lost").length;
  const wonCount = leads.filter((l) => l.status === "won").length;
  const closedCount = wonCount + lostCount;

  return {
    funnel,
    lostCount,
    totalLeads: leads.length,
    conversionRatePct: closedCount > 0 ? Math.round((100 * wonCount) / closedCount) : null,
  };
}

export interface SalespersonPerformanceRow {
  salespersonId: string;
  salespersonName: string;
  leadsAssigned: number;
  leadsWon: number;
  salesCount: number;
  salesValue: number;
}

/** Prompt 8 §11 — Salesperson Performance Report: leads assigned/won and sales recorded, grouped by `assignedSalespersonId`/`salespersonId`. */
export async function getSalespersonPerformanceReport(user: User): Promise<SalespersonPerformanceRow[]> {
  const [allLeads, allSales, allUsers, allUnits] = await Promise.all([
    leadRepository.list(),
    saleRepository.list(),
    userRepository.list(),
    unitRepository.list(),
  ]);
  const leads = allLeads.filter((l) => canAccessProjectOptional(user, l.interestedProjectId));
  const visibleUnitIds = new Set(filterToVisibleProjects(user, allUnits).map((u) => u.id));
  const sales = allSales.filter((s) => visibleUnitIds.has(s.unitId) && s.status !== "cancelled");
  const usersById = new Map(allUsers.map((u) => [u.id, u]));

  const salespersonIds = new Set([
    ...leads.map((l) => l.assignedSalespersonId).filter((v): v is string => Boolean(v)),
    ...sales.map((s) => s.salespersonId).filter((v): v is string => Boolean(v)),
  ]);

  return [...salespersonIds]
    .map((id) => {
      const ownLeads = leads.filter((l) => l.assignedSalespersonId === id);
      const ownSales = sales.filter((s) => s.salespersonId === id);
      return {
        salespersonId: id,
        salespersonName: usersById.get(id)?.name ?? "Unknown",
        leadsAssigned: ownLeads.length,
        leadsWon: ownLeads.filter((l) => l.status === "won").length,
        salesCount: ownSales.length,
        salesValue: ownSales.reduce((sum, s) => sum + s.salePrice.amount, 0),
      };
    })
    .sort((a, b) => b.salesValue - a.salesValue);
}
