"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { financialAdjustmentRepository, projectExpenseRepository } from "@/features/finance/repository";
import { contractorPaymentRepository } from "@/features/contractors/repository";
import type { FinancialAdjustmentType } from "@/types/finance/base";

export interface FinancialAdjustmentFormState {
  error?: string;
}

const ADJUSTMENT_TYPES: FinancialAdjustmentType[] = [
  "discount",
  "waiver",
  "additional-charge",
  "refund",
  "correction",
  "reversal",
  "transfer",
];
function isAdjustmentType(value: string): value is FinancialAdjustmentType {
  return (ADJUSTMENT_TYPES as string[]).includes(value);
}

/** Same sign convention as `costAllocations/adjustmentActions.ts`: discount/waiver/refund/reversal reduce the effective cost and are stored negative; additional-charge/correction/transfer stay as entered. */
function signedAmount(type: FinancialAdjustmentType, amount: number): number {
  if (type === "discount" || type === "waiver" || type === "refund" || type === "reversal") return -Math.abs(amount);
  return amount;
}

async function requireFinancePermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "finance.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * A non-destructive correction against a real `ProjectExpense` or
 * `ContractorPayment` — never mutates the original record's amount, see
 * `types/finance/project.ts`'s `FinancialAdjustment` doc comment. No
 * approval workflow, matching every other adjustment feature in this app.
 */
export async function createFinancialAdjustment(
  targetType: "expense" | "contractorPayment",
  targetId: string,
  _prevState: FinancialAdjustmentFormState,
  formData: FormData,
): Promise<FinancialAdjustmentFormState> {
  const user = await requireFinancePermission();

  const type = String(formData.get("type") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const target =
    targetType === "expense"
      ? await projectExpenseRepository.findById(targetId)
      : await contractorPaymentRepository.findById(targetId);
  if (!target) return { error: "This record no longer exists." };
  if (!isAdjustmentType(type)) return { error: "Choose a valid adjustment type." };

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount === 0) return { error: "Enter a non-zero amount." };
  if (!reason || reason.length < 3) return { error: "Enter a reason (at least 3 characters)." };

  const id = randomUUID();
  const now = new Date().toISOString();

  await financialAdjustmentRepository.create({
    id,
    projectId: target.projectId,
    targetType,
    targetId,
    type,
    category: type,
    date: now,
    amount: { amount: signedAmount(type, amount), currency: "BDT" },
    reason,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "financialAdjustment.create", entityType: "FinancialAdjustment", entityId: id });

  revalidatePath(targetType === "expense" ? `/admin/finance/expenses/${targetId}` : "/admin/construction");
  return {};
}
