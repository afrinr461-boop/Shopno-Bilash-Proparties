"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { constructionPhaseRepository, constructionTaskRepository, scheduleRevisionRepository } from "@/features/construction/repository";

export interface ScheduleRevisionFormState {
  error?: string;
}

async function requireConstructionPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "construction.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * Revises a phase's or task's target date — distinct from the plain edit
 * form so routine setup doesn't spam history: this is the ONE path that
 * writes a `ScheduleRevision` row, permanently preserving the original
 * date, the new date, who changed it, when, and why (§13). The live
 * `endDate` field is updated so every other read (delay detection, the
 * timeline) always compares against the current target.
 */
export async function reviseSchedule(
  targetType: "phase" | "task",
  targetId: string,
  _prevState: ScheduleRevisionFormState,
  formData: FormData,
): Promise<ScheduleRevisionFormState> {
  const user = await requireConstructionPermission();

  const newTargetDate = String(formData.get("newTargetDate") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!newTargetDate) return { error: "Enter the new target date." };
  if (!reason || reason.length < 3) return { error: "Enter a reason for the change (at least 3 characters)." };

  const existing = targetType === "phase" ? await constructionPhaseRepository.findById(targetId) : await constructionTaskRepository.findById(targetId);
  if (!existing) return { error: "This record no longer exists." };

  const previousTargetDate = existing.endDate;
  if (!previousTargetDate) return { error: "This record has no current target date to revise — set one via Edit first." };
  if (previousTargetDate === newTargetDate) return { error: "That's already the current target date." };

  const now = new Date().toISOString();
  const id = randomUUID();

  await scheduleRevisionRepository.create({
    id,
    targetType,
    targetId,
    projectId: existing.projectId,
    previousTargetDate,
    newTargetDate,
    reason,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  if (targetType === "phase") {
    await constructionPhaseRepository.update(targetId, { endDate: newTargetDate, updatedBy: user.id, updatedAt: now });
  } else {
    await constructionTaskRepository.update(targetId, { endDate: newTargetDate, updatedBy: user.id, updatedAt: now });
  }

  await recordAuditEvent({ actorUserId: user.id, action: "scheduleRevision.create", entityType: "ScheduleRevision", entityId: id });

  const phaseIdForRevalidate = targetType === "phase" ? targetId : (existing as { phaseId?: string }).phaseId;
  if (phaseIdForRevalidate) revalidatePath(`/admin/construction/${phaseIdForRevalidate}`);
  revalidatePath(`/admin/projects/${existing.projectId}/construction`);
  return {};
}
