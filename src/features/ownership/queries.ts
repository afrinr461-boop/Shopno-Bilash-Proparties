import "server-only";
import { ownershipRecordRepository } from "@/features/ownership/repository";
import type { ID } from "@/types/common";
import type { OwnershipRecord, OwnershipTargetType } from "@/types/ownership";

export async function getCurrentOwnershipRecord(
  targetType: OwnershipTargetType,
  targetId: ID,
): Promise<OwnershipRecord | undefined> {
  const records = await ownershipRecordRepository.list();
  return records.find((r) => r.targetType === targetType && r.targetId === targetId && !r.endDate);
}

/** Newest first. */
export async function getOwnershipHistory(targetType: OwnershipTargetType, targetId: ID): Promise<OwnershipRecord[]> {
  const records = await ownershipRecordRepository.list();
  return records
    .filter((r) => r.targetType === targetType && r.targetId === targetId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/** Newest first, scoped to one project — for the Dashboard's "Recent Assignments" feed. */
export async function getRecentOwnershipRecords(projectId: ID, limit: number): Promise<OwnershipRecord[]> {
  const records = await ownershipRecordRepository.list();
  return records
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, limit);
}
