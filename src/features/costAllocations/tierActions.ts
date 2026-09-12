"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { costAllocationRepository, unitTierRepository } from "@/features/costAllocations/repository";
import type { TierAdjustmentMode } from "@/types/finance/costAllocation";

async function requireFinancePermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "finance.manage")) throw new Error("Forbidden");
  return user;
}

/** Tiers are only editable while the allocation is still a draft — once contributions are generated, the allocation (and every UnitAllocation it produced) is immutable, same rule as every other method. */
async function requireDraftAllocation(costAllocationId: string) {
  const allocation = await costAllocationRepository.findById(costAllocationId);
  if (!allocation) return { error: "This allocation no longer exists." } as const;
  if (allocation.status !== "draft") return { error: "Tiers can only be edited before contributions are generated." } as const;
  return { allocation } as const;
}

export async function createUnitTier(costAllocationId: string, name: string): Promise<{ error?: string; id?: string }> {
  const user = await requireFinancePermission();
  const check = await requireDraftAllocation(costAllocationId);
  if ("error" in check) return check;
  if (!name.trim()) return { error: "Enter a tier name." };

  const id = randomUUID();
  const now = new Date().toISOString();
  await unitTierRepository.create({
    id,
    costAllocationId,
    projectId: check.allocation.projectId,
    name: name.trim(),
    unitIds: [],
    adjustmentMode: "percentage",
    adjustmentValue: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "unitTier.create", entityType: "UnitTier", entityId: id });
  revalidatePath(`/admin/finance/cost-allocations/${costAllocationId}`);
  return { id };
}

export async function renameUnitTier(tierId: string, name: string): Promise<{ error?: string }> {
  await requireFinancePermission();
  const tier = await unitTierRepository.findById(tierId);
  if (!tier) return { error: "This tier no longer exists." };
  const check = await requireDraftAllocation(tier.costAllocationId);
  if ("error" in check) return check;
  if (!name.trim()) return { error: "Enter a tier name." };

  await unitTierRepository.update(tierId, { name: name.trim() });
  revalidatePath(`/admin/finance/cost-allocations/${tier.costAllocationId}`);
  return {};
}

/**
 * Moves one unit to `targetTierId` (or back to the baseline when null),
 * removing it from whichever other tier of the same allocation currently
 * holds it first — a unit belongs to at most one tier, so this is always a
 * move, never a duplicate membership. One roster row, one call.
 */
export async function moveUnitToTier(costAllocationId: string, unitId: string, targetTierId: string | null): Promise<{ error?: string }> {
  await requireFinancePermission();
  const check = await requireDraftAllocation(costAllocationId);
  if ("error" in check) return check;

  const tiers = (await unitTierRepository.list()).filter((t) => t.costAllocationId === costAllocationId);
  for (const tier of tiers) {
    if (tier.id !== targetTierId && tier.unitIds.includes(unitId)) {
      await unitTierRepository.update(tier.id, { unitIds: tier.unitIds.filter((id) => id !== unitId) });
    }
  }
  if (targetTierId) {
    const target = tiers.find((t) => t.id === targetTierId);
    if (!target) return { error: "This tier no longer exists." };
    if (!target.unitIds.includes(unitId)) {
      await unitTierRepository.update(targetTierId, { unitIds: [...target.unitIds, unitId] });
    }
  }

  revalidatePath(`/admin/finance/cost-allocations/${costAllocationId}`);
  return {};
}

export async function setUnitTierAdjustment(
  tierId: string,
  adjustmentMode: TierAdjustmentMode,
  adjustmentValue: number,
): Promise<{ error?: string }> {
  await requireFinancePermission();
  const tier = await unitTierRepository.findById(tierId);
  if (!tier) return { error: "This tier no longer exists." };
  const check = await requireDraftAllocation(tier.costAllocationId);
  if ("error" in check) return check;
  if (!Number.isFinite(adjustmentValue)) return { error: "Enter a valid adjustment value." };

  await unitTierRepository.update(tierId, { adjustmentMode, adjustmentValue });
  revalidatePath(`/admin/finance/cost-allocations/${tier.costAllocationId}`);
  return {};
}

/**
 * Batch version of `moveUnitToTier` for the size-grouped picker — moves
 * every unit in `unitIds` to `targetTierId` in one call, so assigning "all
 * 1,100 sqft units" to a tier is one round trip instead of one per unit.
 */
export async function moveUnitsToTier(costAllocationId: string, unitIds: string[], targetTierId: string | null): Promise<{ error?: string }> {
  await requireFinancePermission();
  const check = await requireDraftAllocation(costAllocationId);
  if ("error" in check) return check;
  if (unitIds.length === 0) return {};

  const moveSet = new Set(unitIds);
  const tiers = (await unitTierRepository.list()).filter((t) => t.costAllocationId === costAllocationId);
  for (const tier of tiers) {
    if (tier.id === targetTierId) continue;
    const filtered = tier.unitIds.filter((id) => !moveSet.has(id));
    if (filtered.length !== tier.unitIds.length) {
      await unitTierRepository.update(tier.id, { unitIds: filtered });
    }
  }
  if (targetTierId) {
    const target = tiers.find((t) => t.id === targetTierId);
    if (!target) return { error: "This tier no longer exists." };
    const merged = [...new Set([...target.unitIds, ...unitIds])];
    await unitTierRepository.update(targetTierId, { unitIds: merged });
  }

  revalidatePath(`/admin/finance/cost-allocations/${costAllocationId}`);
  return {};
}

/** Deleting a tier reverts its member units to the baseline — they simply become unassigned, nothing else to reconcile since tiers are just a grouping layer over the same unit list. */
export async function deleteUnitTier(tierId: string): Promise<{ error?: string }> {
  const user = await requireFinancePermission();
  const tier = await unitTierRepository.findById(tierId);
  if (!tier) return {};
  const check = await requireDraftAllocation(tier.costAllocationId);
  if ("error" in check) return check;

  await unitTierRepository.remove(tierId);
  await recordAuditEvent({ actorUserId: user.id, action: "unitTier.delete", entityType: "UnitTier", entityId: tierId });
  revalidatePath(`/admin/finance/cost-allocations/${tier.costAllocationId}`);
  return {};
}
