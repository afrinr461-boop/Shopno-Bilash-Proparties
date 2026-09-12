import { ownershipTransferRepository } from "@/features/ownership/repository";
import { projectExpenseRepository } from "@/features/finance/repository";
import { contractorPaymentRepository, contractorRepository } from "@/features/contractors/repository";
import { customerRepository } from "@/features/customers/repository";
import { unitRepository } from "@/features/units/repository";
import { userRepository } from "@/features/users/repository";
import { filterToVisibleProjects, canAccessProjectOptional } from "@/lib/projectScope";
import type { User } from "@/types/user";

export type ApprovalItemType = "ownership-transfer" | "expense-verification" | "contractor-payment-verification";

export interface ApprovalQueueItem {
  id: string;
  type: ApprovalItemType;
  title: string;
  description: string;
  projectId?: string;
  requestedBy?: string;
  requestedDate: string;
  priority: "low" | "medium" | "high" | "critical";
  href: string;
}

/**
 * Prompt 9 §9 — a real, unified queue over statuses that already existed
 * for their own reasons (`OwnershipTransfer.status` from Prompt 8,
 * `ProjectExpense.status`/`ContractorPayment.status` from Prompt 6) but
 * had no cross-domain "everything waiting on me" view before this. Never
 * a new workflow engine — approving/rejecting here calls the same
 * `approveOwnershipTransfer`/`setExpenseStatus`/`setContractorPaymentStatus`
 * actions those domains already own.
 */
export async function getApprovalQueue(user: User): Promise<ApprovalQueueItem[]> {
  const [transfers, expenses, contractorPayments, units, customers, contractors, users] = await Promise.all([
    ownershipTransferRepository.list(),
    projectExpenseRepository.list(),
    contractorPaymentRepository.list(),
    unitRepository.list(),
    customerRepository.list(),
    contractorRepository.list(),
    userRepository.list(),
  ]);

  const unitsById = new Map(units.map((u) => [u.id, u]));
  const customersById = new Map(customers.map((c) => [c.id, c]));
  const contractorsById = new Map(contractors.map((c) => [c.id, c]));
  const usersById = new Map(users.map((u) => [u.id, u]));

  const items: ApprovalQueueItem[] = [];

  for (const t of filterToVisibleProjects(user, transfers)) {
    if (t.status !== "pending") continue;
    items.push({
      id: t.id,
      type: "ownership-transfer",
      title: `Ownership transfer — ${unitsById.get(t.unitId)?.unitNumber ?? "Unit"}`,
      description: `To ${customersById.get(t.newOwnerId)?.name ?? "new customer"} — ${t.reason}`,
      projectId: t.projectId,
      requestedBy: usersById.get(t.createdBy)?.name,
      requestedDate: t.createdAt,
      priority: "high",
      href: `/admin/properties/${t.unitId}`,
    });
  }

  for (const e of filterToVisibleProjects(user, expenses)) {
    if (e.status !== "pending" && e.status !== "submitted") continue;
    items.push({
      id: e.id,
      type: "expense-verification",
      title: `Expense — ${e.description}`,
      description: `${e.amount.amount.toLocaleString()} BDT · ${e.category}`,
      projectId: e.projectId,
      requestedBy: usersById.get(e.createdBy)?.name,
      requestedDate: e.createdAt,
      priority: "medium",
      href: `/admin/finance/expenses/${e.id}`,
    });
  }

  for (const p of contractorPayments.filter((p) => canAccessProjectOptional(user, p.projectId))) {
    if (p.status !== "pending" && p.status !== "submitted") continue;
    items.push({
      id: p.id,
      type: "contractor-payment-verification",
      title: `Contractor payment — ${contractorsById.get(p.contractorId)?.name ?? "Contractor"}`,
      description: `${p.amount.amount.toLocaleString()} BDT`,
      projectId: p.projectId,
      requestedBy: usersById.get(p.createdBy)?.name,
      requestedDate: p.createdAt,
      priority: "medium",
      href: "/admin/approvals",
    });
  }

  return items.sort((a, b) => b.requestedDate.localeCompare(a.requestedDate));
}
