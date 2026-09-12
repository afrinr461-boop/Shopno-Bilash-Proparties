"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import {
  costAllocationRepository,
  ownerContributionRepository,
  goalInstallmentRepository,
  ownerInstallmentObligationRepository,
  contributionPaymentRepository,
} from "@/features/costAllocations/repository";
import { reconcileRounding } from "@/features/costAllocations/rounding";
import type { InstallmentAmountMode } from "@/types/finance/costAllocation";

export interface InstallmentPlanInput {
  label: string;
  amountMode: InstallmentAmountMode;
  amountValue: number;
  dueDate: string;
  notes?: string;
}

export interface InstallmentPlanFormState {
  error?: string;
}

async function requireFinancePermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "finance.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * A goal's own installment schedule — deliberately NOT the existing
 * `Installment`/`Contract` types (`src/types/sales.ts`). Those model a
 * unit's SALE-PRICE payment plan tied to a sales Contract with a customer;
 * this models a construction-goal CONTRIBUTION's payment plan, owed by
 * every owner (customer, shareholder, or landowner) with a stake in the
 * goal. Reusing the sale-side type would conflate two unrelated debts
 * under one concept, so this is a new, separate mechanism.
 *
 * Only callable once the allocation is "generated" (owner contributions
 * must already exist to split into installments). Splits each owner's
 * `payableAmount` across the given installments, reconciling per owner
 * (via `reconcileRounding`) so that owner's installments sum exactly to
 * their contribution total — never approximately.
 */
export async function createGoalInstallmentPlan(
  costAllocationId: string,
  installments: InstallmentPlanInput[],
): Promise<{ error?: string }> {
  const user = await requireFinancePermission();

  const allocation = await costAllocationRepository.findById(costAllocationId);
  if (!allocation) return { error: "This allocation no longer exists." };
  if (allocation.status !== "generated") return { error: "Generate contributions before creating an installment plan." };
  if (installments.length === 0) return { error: "Add at least one installment." };

  const existingInstallments = await goalInstallmentRepository.list();
  if (existingInstallments.some((i) => i.costAllocationId === costAllocationId)) {
    return { error: "An installment plan already exists for this allocation — delete it first to redefine." };
  }

  const allContributions = await ownerContributionRepository.list();
  const contributions = allContributions.filter((c) => c.costAllocationId === costAllocationId);
  if (contributions.length === 0) return { error: "No owner contributions exist for this allocation." };

  const percentageMode = installments.every((i) => i.amountMode === "percentage");
  if (percentageMode) {
    const totalPercent = installments.reduce((s, i) => s + i.amountValue, 0);
    if (Math.round(totalPercent) !== 100) {
      return { error: `Percentages must sum to 100 — currently ${totalPercent}.` };
    }
  }

  const now = new Date().toISOString();
  const createdInstallments = [];

  for (let i = 0; i < installments.length; i++) {
    const input = installments[i];
    const id = randomUUID();
    await goalInstallmentRepository.create({
      id,
      costAllocationId,
      projectId: allocation.projectId,
      installmentNumber: i + 1,
      label: input.label,
      amountMode: input.amountMode,
      amountValue: input.amountValue,
      dueDate: input.dueDate,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
    });
    createdInstallments.push({ id, input });
  }

  // Per-owner reconciliation: each owner's installment shares must sum exactly to their contribution's payableAmount.
  for (const contribution of contributions) {
    const rawPerInstallment = createdInstallments.map(({ id, input }) => ({
      key: id,
      amount:
        input.amountMode === "percentage"
          ? contribution.payableAmount.amount * (input.amountValue / 100)
          : input.amountValue,
    }));
    const reconciled = reconcileRounding(rawPerInstallment, contribution.payableAmount.amount);

    for (const { id: goalInstallmentId } of createdInstallments) {
      await ownerInstallmentObligationRepository.create({
        id: randomUUID(),
        goalInstallmentId,
        contributionId: contribution.id,
        projectId: allocation.projectId,
        ownerType: contribution.ownerType,
        ownerId: contribution.ownerId,
        payableAmount: { amount: reconciled.get(goalInstallmentId) ?? 0, currency: "BDT" },
        createdAt: now,
        updatedAt: now,
        createdBy: user.id,
      });
    }
  }

  await recordAuditEvent({
    actorUserId: user.id,
    action: "goalInstallment.createPlan",
    entityType: "CostAllocation",
    entityId: costAllocationId,
  });

  revalidatePath(`/admin/finance/cost-allocations/${costAllocationId}`);
  return {};
}

/** Deletes an entire installment plan (all GoalInstallments + their OwnerInstallmentObligations for one allocation) — refuses once any payment has been tagged to one of its obligations, to avoid orphaning payment history. */
export async function deleteGoalInstallmentPlan(costAllocationId: string): Promise<{ error?: string }> {
  const user = await requireFinancePermission();

  const installments = (await goalInstallmentRepository.list()).filter((i) => i.costAllocationId === costAllocationId);
  if (installments.length === 0) return {};

  const allObligations = await ownerInstallmentObligationRepository.list();
  const obligationIds = new Set(
    allObligations.filter((o) => installments.some((i) => i.id === o.goalInstallmentId)).map((o) => o.id),
  );
  const payments = await contributionPaymentRepository.list();
  if (payments.some((p) => p.installmentObligationId && obligationIds.has(p.installmentObligationId))) {
    return { error: "Can't delete an installment plan that already has payments recorded against it." };
  }

  for (const obligationId of obligationIds) {
    await ownerInstallmentObligationRepository.remove(obligationId);
  }
  for (const installment of installments) {
    await goalInstallmentRepository.remove(installment.id);
  }

  await recordAuditEvent({
    actorUserId: user.id,
    action: "goalInstallment.deletePlan",
    entityType: "CostAllocation",
    entityId: costAllocationId,
  });

  revalidatePath(`/admin/finance/cost-allocations/${costAllocationId}`);
  return {};
}
