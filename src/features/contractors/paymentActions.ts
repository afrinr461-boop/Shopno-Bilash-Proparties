"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, hasAnyPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { contractorPaymentRepository, contractorRepository } from "@/features/contractors/repository";
import { projectRepository } from "@/features/projects/repository";
import type { TransactionPaymentMethod, TransactionStatus } from "@/types/finance/base";

export interface ContractorPaymentFormState {
  error?: string;
}

async function requireConstructionPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "construction.manage")) throw new Error("Forbidden");
  return user;
}

/** A real payment record — one of the three transaction sources `computePhaseActualCost` sums; not a payables ledger, no approval workflow, matching Prompt 4's own "don't over-build accounting" convention. */
export async function recordContractorPayment(
  _prevState: ContractorPaymentFormState,
  formData: FormData,
): Promise<ContractorPaymentFormState> {
  const user = await requireConstructionPermission();

  const projectId = String(formData.get("projectId") ?? "").trim();
  const contractorId = String(formData.get("contractorId") ?? "").trim();
  const phaseId = String(formData.get("phaseId") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const date = String(formData.get("date") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "").trim();
  const accountId = String(formData.get("accountId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!projectId) return { error: "Choose a project." };
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." };
  if (!contractorId) return { error: "Choose a contractor." };
  const contractor = await contractorRepository.findById(contractorId);
  if (!contractor) return { error: "That contractor no longer exists." };
  if (!date) return { error: "Enter a payment date." };

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter a valid amount." };

  const id = randomUUID();
  const now = new Date().toISOString();

  await contractorPaymentRepository.create({
    id,
    projectId,
    contractorId,
    phaseId: phaseId || undefined,
    amount: { amount, currency: "BDT" },
    date,
    reference: reference || undefined,
    notes: notes || undefined,
    paymentMethod: (paymentMethod || undefined) as TransactionPaymentMethod | undefined,
    accountId: accountId || undefined,
    status: (status || undefined) as TransactionStatus | undefined,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "contractorPayment.create", entityType: "ContractorPayment", entityId: id });

  revalidatePath("/admin/construction");
  if (phaseId) revalidatePath(`/admin/construction/${phaseId}`);
  revalidatePath(`/admin/projects/${projectId}/construction`);
  return {};
}

/** Prompt 9 — the Approval Queue's verify/reject action for a contractor payment pending/submitted verification. Reachable via `construction.manage` or the cross-domain `approvals.manage`. */
export async function setContractorPaymentStatus(id: string, status: TransactionStatus): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasAnyPermission(user.role, ["construction.manage", "approvals.manage"])) throw new Error("Forbidden");

  const existing = await contractorPaymentRepository.findById(id);
  if (!existing) return { error: "This payment no longer exists." };

  await contractorPaymentRepository.update(id, { status, updatedBy: user.id, updatedAt: new Date().toISOString() });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "contractorPayment.setStatus",
    entityType: "ContractorPayment",
    entityId: id,
    projectId: existing.projectId,
    previousValue: existing.status,
    newValue: status,
  });

  revalidatePath("/admin/construction");
  revalidatePath("/admin/approvals");
  return {};
}
