"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { agreementRepository, landownerAllocationRepository } from "@/features/landowners/repository";
import { unitRepository } from "@/features/units/repository";
import { openOwnershipRecord, closeOwnershipRecord } from "@/features/ownership/writeThrough";

async function requireLandownerPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "landowner.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * `LandownerAllocation` (`types/landowner.ts`) was a fully modeled type +
 * Prisma model + repository with no actions ever exercising it — this is
 * that missing write path: hands a specific unit back to a landowner under
 * a signed agreement. A unit must be currently unowned (no customer/
 * shareholder/landowner pointer set) — one unit belongs to exactly one
 * owner.
 */
export async function createLandownerAllocation(
  landownerId: string,
  agreementId: string,
  unitId: string,
): Promise<{ error?: string }> {
  const user = await requireLandownerPermission();

  const agreement = await agreementRepository.findById(agreementId);
  if (!agreement) return { error: "This agreement no longer exists." };

  const unit = await unitRepository.findById(unitId);
  if (!unit) return { error: "That unit no longer exists." };
  if (unit.customerId || unit.shareholderId || unit.landownerAllocationId) {
    return { error: "That unit already has an owner." };
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await landownerAllocationRepository.create({
    id,
    agreementId,
    landownerId,
    unitId,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await unitRepository.update(unitId, { landownerAllocationId: id, status: "allocated" });

  await openOwnershipRecord({
    targetType: "unit",
    targetId: unitId,
    projectId: unit.projectId,
    ownerType: "landowner",
    ownerId: landownerId,
    source: "landowner-allocation",
    sourceRecordId: id,
    startDate: now,
    actorUserId: user.id,
  });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "landownerAllocation.create",
    entityType: "LandownerAllocation",
    entityId: id,
  });

  revalidatePath(`/admin/landowners/${landownerId}`);
  return {};
}

/** Reverses `createLandownerAllocation` — frees the unit back to "available". */
export async function deleteLandownerAllocationByUnit(landownerId: string, unitId: string): Promise<void> {
  const user = await requireLandownerPermission();

  const allocations = await landownerAllocationRepository.list();
  const allocation = allocations.find((a) => a.landownerId === landownerId && a.unitId === unitId);
  if (!allocation) return;

  await landownerAllocationRepository.remove(allocation.id);
  await unitRepository.update(unitId, { landownerAllocationId: undefined, status: "available" });
  await closeOwnershipRecord("unit", unitId);

  await recordAuditEvent({
    actorUserId: user.id,
    action: "landownerAllocation.delete",
    entityType: "LandownerAllocation",
    entityId: allocation.id,
  });

  revalidatePath(`/admin/landowners/${landownerId}`);
}
