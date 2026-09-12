"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { ownerContributionRepository, contributionAdjustmentRepository } from "@/features/costAllocations/repository";
import type { AdjustmentType } from "@/types/finance/costAllocation";

export interface AdjustmentFormState {
  error?: string;
}

const ADJUSTMENT_TYPES: AdjustmentType[] = ["discount", "waiver", "additional-charge", "correction", "refund"];
function isAdjustmentType(value: string): value is AdjustmentType {
  return (ADJUSTMENT_TYPES as string[]).includes(value);
}

/** Discount/waiver/refund are entered as positive numbers in the form and stored negative (they reduce what's owed); additional-charge and correction stay as entered (an admin can type a negative correction to reduce, or positive to increase). */
function signedAmount(type: AdjustmentType, amount: number): number {
  if (type === "discount" || type === "waiver" || type === "refund") return -Math.abs(amount);
  return amount;
}

async function requireFinancePermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "finance.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * A lightweight, non-destructive correction to a contribution's effective
 * payable — never mutates `OwnerContribution.payableAmount` itself (see
 * `computeContributionState`'s `adjustments` parameter). No approval
 * workflow, per the brief's explicit "don't over-build a full accounting
 * system" instruction — a flat record with a reason is the whole feature.
 */
export async function createContributionAdjustment(
  costAllocationId: string,
  _prevState: AdjustmentFormState,
  formData: FormData,
): Promise<AdjustmentFormState> {
  const user = await requireFinancePermission();

  const contributionId = String(formData.get("contributionId") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!contributionId) return { error: "Missing contribution." };
  const contribution = await ownerContributionRepository.findById(contributionId);
  if (!contribution) return { error: "This contribution no longer exists." };
  if (!isAdjustmentType(type)) return { error: "Choose a valid adjustment type." };

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount === 0) return { error: "Enter a non-zero amount." };
  if (!reason || reason.length < 3) return { error: "Enter a reason (at least 3 characters)." };

  const id = randomUUID();
  const now = new Date().toISOString();

  await contributionAdjustmentRepository.create({
    id,
    contributionId,
    projectId: contribution.projectId,
    type,
    amount: { amount: signedAmount(type, amount), currency: "BDT" },
    reason,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "contributionAdjustment.create",
    entityType: "ContributionAdjustment",
    entityId: id,
  });

  revalidatePath(`/admin/finance/cost-allocations/${costAllocationId}`);
  return {};
}
