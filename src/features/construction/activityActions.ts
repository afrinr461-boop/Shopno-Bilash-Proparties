"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { constructionActivityLogRepository } from "@/features/construction/repository";
import { projectRepository } from "@/features/projects/repository";

export interface ActivityLogFormState {
  error?: string;
}

async function requireConstructionPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "construction.manage")) throw new Error("Forbidden");
  return user;
}

/** A chronological journal entry — deliberately never touches any stage's stored `progressPercentage` on its own (see the type's own doc comment). */
export async function recordActivity(_prevState: ActivityLogFormState, formData: FormData): Promise<ActivityLogFormState> {
  const user = await requireConstructionPermission();

  const projectId = String(formData.get("projectId") ?? "").trim();
  const phaseId = String(formData.get("phaseId") ?? "").trim();
  const taskId = String(formData.get("taskId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const activity = String(formData.get("activity") ?? "").trim();
  const contractorId = String(formData.get("contractorId") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!projectId) return { error: "Choose a project." };
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." };
  if (!date) return { error: "Enter a date." };
  if (!activity || activity.length < 3) return { error: "Describe the activity (at least 3 characters)." };

  const id = randomUUID();
  const now = new Date().toISOString();

  await constructionActivityLogRepository.create({
    id,
    projectId,
    phaseId: phaseId || undefined,
    taskId: taskId || undefined,
    date,
    activity,
    contractorId: contractorId || undefined,
    notes: notes || undefined,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "constructionActivityLog.create", entityType: "ConstructionActivityLog", entityId: id });

  revalidatePath(`/admin/projects/${projectId}/construction`);
  if (phaseId) revalidatePath(`/admin/construction/${phaseId}`);
  return { };
}

export async function deleteActivity(id: string): Promise<{ error?: string }> {
  const user = await requireConstructionPermission();

  const existing = await constructionActivityLogRepository.findById(id);
  if (!existing) return {};

  await constructionActivityLogRepository.remove(id);
  await recordAuditEvent({ actorUserId: user.id, action: "constructionActivityLog.delete", entityType: "ConstructionActivityLog", entityId: id });

  revalidatePath(`/admin/projects/${existing.projectId}/construction`);
  return {};
}
