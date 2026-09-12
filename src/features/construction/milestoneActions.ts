"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { milestoneRepository } from "@/features/construction/repository";

export interface MilestoneFormState {
  error?: string;
}

async function requireConstructionPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "construction.manage")) throw new Error("Forbidden");
  return user;
}

export async function createMilestone(_prevState: MilestoneFormState, formData: FormData): Promise<MilestoneFormState> {
  const user = await requireConstructionPermission();

  const projectId = String(formData.get("projectId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const relatedPhaseId = String(formData.get("relatedPhaseId") ?? "").trim();
  const targetDate = String(formData.get("targetDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!projectId) return { error: "Choose a project." };
  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." };

  const id = randomUUID();
  const now = new Date().toISOString();

  await milestoneRepository.create({
    id,
    projectId,
    name,
    relatedPhaseId: relatedPhaseId || undefined,
    targetDate: targetDate || undefined,
    status: "upcoming",
    notes: notes || undefined,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "milestone.create", entityType: "Milestone", entityId: id });

  revalidatePath(`/admin/projects/${projectId}/construction`);
  return {};
}

export async function completeMilestone(id: string): Promise<{ error?: string }> {
  const user = await requireConstructionPermission();

  const existing = await milestoneRepository.findById(id);
  if (!existing) return { error: "This milestone no longer exists." };

  const now = new Date().toISOString();
  await milestoneRepository.update(id, { status: "completed", completedDate: now, updatedBy: user.id, updatedAt: now });
  await recordAuditEvent({ actorUserId: user.id, action: "milestone.complete", entityType: "Milestone", entityId: id });

  revalidatePath(`/admin/projects/${existing.projectId}/construction`);
  return {};
}

export async function deleteMilestone(id: string): Promise<{ error?: string }> {
  const user = await requireConstructionPermission();

  const existing = await milestoneRepository.findById(id);
  if (!existing) return {};

  await milestoneRepository.remove(id);
  await recordAuditEvent({ actorUserId: user.id, action: "milestone.delete", entityType: "Milestone", entityId: id });

  revalidatePath(`/admin/projects/${existing.projectId}/construction`);
  return {};
}
