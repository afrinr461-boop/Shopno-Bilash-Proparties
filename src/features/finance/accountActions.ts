"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { cashAccountRepository, projectExpenseRepository } from "@/features/finance/repository";
import { contractorPaymentRepository } from "@/features/contractors/repository";
import type { LifecycleStatus } from "@/types/contractor";
import type { CashAccountType } from "@/types/finance/account";

export interface CashAccountFormState {
  error?: string;
}

async function requireFinancePermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "finance.manage")) throw new Error("Forbidden");
  return user;
}

function parseAccountFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim() as CashAccountType;
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  const bankName = String(formData.get("bankName") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." } as const;
  if (!["cash", "bank", "mobile-banking"].includes(type)) return { error: "Choose an account type." } as const;

  return {
    fields: {
      name,
      type,
      accountNumber: accountNumber || undefined,
      bankName: bankName || undefined,
      notes: notes || undefined,
    },
  } as const;
}

export async function createCashAccount(_prevState: CashAccountFormState, formData: FormData): Promise<CashAccountFormState> {
  const user = await requireFinancePermission();

  const parsed = parseAccountFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();
  await cashAccountRepository.create({
    id,
    ...fields,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "cashAccount.create", entityType: "CashAccount", entityId: id });

  revalidatePath("/admin/finance/accounts");
  return {};
}

export async function updateCashAccount(
  id: string,
  _prevState: CashAccountFormState,
  formData: FormData,
): Promise<CashAccountFormState> {
  const user = await requireFinancePermission();

  const parsed = parseAccountFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await cashAccountRepository.findById(id);
  if (!existing) return { error: "This account no longer exists." };

  await cashAccountRepository.update(id, { ...fields, updatedBy: user.id, updatedAt: new Date().toISOString() });

  await recordAuditEvent({ actorUserId: user.id, action: "cashAccount.update", entityType: "CashAccount", entityId: id });

  revalidatePath("/admin/finance/accounts");
  return {};
}

/** Hard delete only when no expense/contractor payment references it — otherwise use `setCashAccountStatus` to retire it. */
export async function deleteCashAccount(id: string): Promise<{ error?: string }> {
  const user = await requireFinancePermission();

  const [expenses, payments] = await Promise.all([projectExpenseRepository.list(), contractorPaymentRepository.list()]);
  if (expenses.some((e) => e.accountId === id) || payments.some((p) => p.accountId === id)) {
    return { error: "This account still has transactions recorded against it — retire it instead." };
  }

  await cashAccountRepository.remove(id);
  await recordAuditEvent({ actorUserId: user.id, action: "cashAccount.delete", entityType: "CashAccount", entityId: id });

  revalidatePath("/admin/finance/accounts");
  return {};
}

export async function setCashAccountStatus(id: string, status: LifecycleStatus): Promise<{ error?: string }> {
  const user = await requireFinancePermission();

  const existing = await cashAccountRepository.findById(id);
  if (!existing) return { error: "This account no longer exists." };

  await cashAccountRepository.update(id, { status, updatedBy: user.id, updatedAt: new Date().toISOString() });
  await recordAuditEvent({ actorUserId: user.id, action: "cashAccount.setStatus", entityType: "CashAccount", entityId: id });

  revalidatePath("/admin/finance/accounts");
  return {};
}
