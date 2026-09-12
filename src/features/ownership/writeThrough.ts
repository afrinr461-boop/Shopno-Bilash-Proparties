import "server-only";
import { randomUUID } from "node:crypto";
import { ownershipRecordRepository } from "@/features/ownership/repository";
import type { ID } from "@/types/common";
import type { OwnershipSource, OwnershipTargetType } from "@/types/ownership";
import type { OwnerType } from "@/types/finance/costAllocation";

export interface OpenOwnershipRecordInput {
  targetType: OwnershipTargetType;
  targetId: ID;
  projectId: ID;
  ownerType: OwnerType;
  ownerId: ID;
  source: OwnershipSource;
  sourceRecordId?: ID;
  startDate: string;
  actorUserId: ID;
}

/**
 * Opens a new ownership span. Callers are the existing assign-style
 * actions (createSale, assignUnitToShareholding, createLandownerAllocation,
 * assignParkingToOwner) — this never runs standalone without one of those
 * having just set the target's fast-path owner field(s).
 */
export async function openOwnershipRecord(input: OpenOwnershipRecordInput): Promise<void> {
  const now = new Date().toISOString();
  const id = randomUUID();
  await ownershipRecordRepository.create({
    id,
    targetType: input.targetType,
    targetId: input.targetId,
    projectId: input.projectId,
    ownerType: input.ownerType,
    ownerId: input.ownerId,
    source: input.source,
    sourceRecordId: input.sourceRecordId,
    startDate: input.startDate,
    createdAt: now,
    updatedAt: now,
    createdBy: input.actorUserId,
  });
}

/**
 * Closes whichever span is currently open (no `endDate`) for this target —
 * at most one should ever be open at a time, enforced by every caller
 * always closing before opening a replacement. A target with no open span
 * (e.g. it was never assigned) is a silent no-op, not an error.
 */
export async function closeOwnershipRecord(
  targetType: OwnershipTargetType,
  targetId: ID,
  endDate: string = new Date().toISOString(),
): Promise<void> {
  const records = await ownershipRecordRepository.list();
  const open = records.find((r) => r.targetType === targetType && r.targetId === targetId && !r.endDate);
  if (!open) return;
  await ownershipRecordRepository.update(open.id, { endDate });
}
