"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, hasAnyPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { projectExpenseRepository } from "@/features/finance/repository";
import { projectRepository } from "@/features/projects/repository";
import type { TransactionPaymentMethod, TransactionStatus } from "@/types/finance/base";

export interface ExpenseFormState {
  error?: string;
}

async function requireFinancePermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "finance.manage")) throw new Error("Forbidden");
  return user;
}

async function parseExpenseFields(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const subcategory = String(formData.get("subcategory") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const vendorId = String(formData.get("vendorId") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const constructionPhaseId = String(formData.get("constructionPhaseId") ?? "").trim();
  const contractorId = String(formData.get("contractorId") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "").trim();
  const accountId = String(formData.get("accountId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!projectId) return { error: "Choose a project." } as const;
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." } as const;
  if (!description || description.length < 3) return { error: "Description must be at least 3 characters." } as const;
  if (!category) return { error: "Enter a category, e.g. \"Labor\" or \"Materials\"." } as const;
  if (!date) return { error: "Enter a date." } as const;

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter a valid amount." } as const;

  return {
    fields: {
      projectId,
      description,
      category,
      subcategory: subcategory || undefined,
      date,
      amount,
      vendorId: vendorId || undefined,
      reference: reference || undefined,
      constructionPhaseId: constructionPhaseId || undefined,
      contractorId: contractorId || undefined,
      buildingId: buildingId || undefined,
      paymentMethod: (paymentMethod || undefined) as TransactionPaymentMethod | undefined,
      accountId: accountId || undefined,
      status: (status || undefined) as TransactionStatus | undefined,
    },
  } as const;
}

export async function createExpense(_prevState: ExpenseFormState, formData: FormData): Promise<ExpenseFormState> {
  const user = await requireFinancePermission();

  const parsed = await parseExpenseFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await projectExpenseRepository.create({
    id,
    date: fields.date,
    amount: { amount: fields.amount, currency: "BDT" },
    category: fields.category,
    subcategory: fields.subcategory,
    projectId: fields.projectId,
    reference: fields.reference,
    description: fields.description,
    vendorId: fields.vendorId,
    constructionPhaseId: fields.constructionPhaseId,
    contractorId: fields.contractorId,
    buildingId: fields.buildingId,
    paymentMethod: fields.paymentMethod,
    accountId: fields.accountId,
    status: fields.status,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "expense.create", entityType: "ProjectExpense", entityId: id });

  revalidatePath("/admin/finance/expenses");
  redirect("/admin/finance/expenses");
}

export async function updateExpense(
  id: string,
  _prevState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const user = await requireFinancePermission();

  const parsed = await parseExpenseFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await projectExpenseRepository.findById(id);
  if (!existing) return { error: "This expense no longer exists." };

  const updated = await projectExpenseRepository.update(id, {
    date: fields.date,
    amount: { amount: fields.amount, currency: "BDT" },
    category: fields.category,
    subcategory: fields.subcategory,
    projectId: fields.projectId,
    reference: fields.reference,
    description: fields.description,
    vendorId: fields.vendorId,
    constructionPhaseId: fields.constructionPhaseId,
    contractorId: fields.contractorId,
    buildingId: fields.buildingId,
    paymentMethod: fields.paymentMethod,
    accountId: fields.accountId,
    status: fields.status,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This expense no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "expense.update", entityType: "ProjectExpense", entityId: id });

  revalidatePath("/admin/finance/expenses");
  revalidatePath(`/admin/finance/expenses/${id}`);
  redirect(`/admin/finance/expenses/${id}`);
}

/** Prompt 9 — the Approval Queue's verify/reject action for an expense pending/submitted verification. Reachable via `finance.manage` or the cross-domain `approvals.manage`. */
export async function setExpenseStatus(id: string, status: TransactionStatus): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasAnyPermission(user.role, ["finance.manage", "approvals.manage"])) throw new Error("Forbidden");

  const existing = await projectExpenseRepository.findById(id);
  if (!existing) return { error: "This expense no longer exists." };

  await projectExpenseRepository.update(id, { status, updatedBy: user.id, updatedAt: new Date().toISOString() });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "expense.setStatus",
    entityType: "ProjectExpense",
    entityId: id,
    projectId: existing.projectId,
    previousValue: existing.status,
    newValue: status,
  });

  revalidatePath("/admin/finance/expenses");
  revalidatePath(`/admin/finance/expenses/${id}`);
  revalidatePath("/admin/approvals");
  return {};
}

export async function deleteExpense(id: string): Promise<void> {
  const user = await requireFinancePermission();

  const existing = await projectExpenseRepository.findById(id);
  if (!existing) return;

  await projectExpenseRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "expense.delete", entityType: "ProjectExpense", entityId: id });

  revalidatePath("/admin/finance/expenses");
}
