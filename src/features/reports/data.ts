import { projectRepository } from "@/features/projects/repository";
import { unitRepository } from "@/features/units/repository";
import { customerRepository } from "@/features/customers/repository";
import { saleRepository } from "@/features/sales/repository";
import { customerPaymentRepository, projectExpenseRepository, projectBudgetRepository } from "@/features/finance/repository";
import { constructionPhaseRepository } from "@/features/construction/repository";
import { contractorPaymentRepository } from "@/features/contractors/repository";
import { purchaseRepository } from "@/features/procurement/repository";
import { leadRepository } from "@/features/crm/repository";
import { documentRepository } from "@/features/documents/repository";
import { canAccessProjectOptional, filterToVisibleProjects, filterVisibleProjectsList } from "@/lib/projectScope";
import type { User } from "@/types/user";

export interface ReportsSummary {
  activeProjects: number;
  units: number;
  constructionPhases: number;
  averageConstructionProgress: number | null;
  customers: number;
  sales: number;
  totalSalesValue: number;
  leads: number;
  totalPaymentsReceived: number;
  totalExpenses: number;
  outstanding: number;
  documents: number;
  totalContractorPayments: number;
  totalMaterialCost: number;
  totalBudget: number;
  totalActualConstructionCost: number;
}

/**
 * Admin Step 18 — Reports Foundation. Every number here is a live
 * aggregate over a repository built in an earlier step (Admin Steps
 * 5-13, 17) — nothing is stored as its own "Report" record, since a
 * report is a computed view, not a domain entity. No repository exists
 * for Booking/Contract/Installment yet, so nothing here claims to report
 * on them.
 */
/** Scoped to `user`'s visible projects — same reasoning as `getDashboardData`. Documents aren't project-filtered (polymorphic ownership, out of scope for this pass). */
export async function getReportsSummary(user: User): Promise<ReportsSummary> {
  const [allProjects, allUnits, customers, allSales, allPayments, allExpenses, allPhases, allLeads, documents, allContractorPayments, allPurchases, allBudgets] =
    await Promise.all([
      projectRepository.list(),
      unitRepository.list(),
      customerRepository.list(),
      saleRepository.list(),
      customerPaymentRepository.list(),
      projectExpenseRepository.list(),
      constructionPhaseRepository.list(),
      leadRepository.list(),
      documentRepository.list(),
      contractorPaymentRepository.list(),
      purchaseRepository.list(),
      projectBudgetRepository.list(),
    ]);

  const projects = filterVisibleProjectsList(user, allProjects);
  const units = filterToVisibleProjects(user, allUnits);
  const visibleUnitIds = new Set(units.map((u) => u.id));
  const sales = allSales.filter((s) => visibleUnitIds.has(s.unitId));
  const payments = allPayments.filter((p) => canAccessProjectOptional(user, p.projectId));
  const expenses = filterToVisibleProjects(user, allExpenses);
  const phases = filterToVisibleProjects(user, allPhases);
  const leads = allLeads.filter((l) => canAccessProjectOptional(user, l.interestedProjectId));
  const contractorPayments = allContractorPayments.filter((p) => canAccessProjectOptional(user, p.projectId));
  const purchases = filterToVisibleProjects(user, allPurchases).filter((p) => p.status !== "cancelled");
  const budgets = filterToVisibleProjects(user, allBudgets);

  const totalSalesValue = sales.reduce((sum, s) => sum + s.salePrice.amount, 0);
  const totalPaymentsReceived = payments.reduce((sum, p) => sum + p.amount.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount.amount, 0);
  const totalContractorPayments = contractorPayments.reduce((sum, p) => sum + p.amount.amount, 0);
  const totalMaterialCost = purchases.reduce((sum, p) => sum + p.total.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.budgeted.amount, 0);

  return {
    activeProjects: projects.length,
    units: units.length,
    constructionPhases: phases.length,
    averageConstructionProgress:
      phases.length === 0 ? null : Math.round(phases.reduce((sum, p) => sum + p.progressPercentage, 0) / phases.length),
    customers: customers.length,
    sales: sales.length,
    totalSalesValue,
    leads: leads.length,
    totalPaymentsReceived,
    totalExpenses,
    outstanding: Math.max(0, totalSalesValue - totalPaymentsReceived),
    documents: documents.length,
    totalContractorPayments,
    totalMaterialCost,
    totalBudget,
    totalActualConstructionCost: totalMaterialCost + totalContractorPayments + totalExpenses,
  };
}
