"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { constructionPhaseRepository, constructionTaskRepository } from "@/features/construction/repository";
import { userRepository } from "@/features/users/repository";
import type { ConstructionStatus, ConstructionPriority } from "@/types/construction";

export interface TaskFormState {
  error?: string;
}

const CONSTRUCTION_STATUSES: ConstructionStatus[] = ["not-started", "planned", "in-progress", "completed", "delayed", "on-hold", "cancelled"];
const PRIORITIES: ConstructionPriority[] = ["low", "medium", "high", "critical"];

function isConstructionStatus(value: string): value is ConstructionStatus {
  return (CONSTRUCTION_STATUSES as string[]).includes(value);
}
function isPriority(value: string): value is ConstructionPriority {
  return (PRIORITIES as string[]).includes(value);
}

function toOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

async function requireConstructionPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "construction.manage")) throw new Error("Forbidden");
  return user;
}

async function parseTaskFields(formData: FormData) {
  const phaseId = String(formData.get("phaseId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const responsibleUserId = String(formData.get("responsibleUserId") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "").trim();
  const floorId = String(formData.get("floorId") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const completionDate = String(formData.get("completionDate") ?? "").trim();
  const progressRaw = String(formData.get("progressPercentage") ?? "");
  const status = String(formData.get("status") ?? "");
  const priority = String(formData.get("priority") ?? "");
  const estimatedCostRaw = String(formData.get("estimatedCost") ?? "");
  const dependsOnRaw = String(formData.get("dependsOnTaskIds") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!phaseId) return { error: "Missing phase." } as const;
  const phase = await constructionPhaseRepository.findById(phaseId);
  if (!phase) return { error: "That phase no longer exists." } as const;
  if (!title) return { error: "Enter a task title." } as const;
  if (!isConstructionStatus(status)) return { error: "Choose a valid status." } as const;
  if (responsibleUserId) {
    const responsible = await userRepository.findById(responsibleUserId);
    if (!responsible) return { error: "That user no longer exists." } as const;
  }

  const progressPercentage = toOptionalNumber(progressRaw);
  if (progressPercentage !== undefined && (progressPercentage < 0 || progressPercentage > 100)) {
    return { error: "Progress must be between 0 and 100." } as const;
  }

  return {
    fields: {
      phaseId,
      projectId: phase.projectId,
      title,
      description: description || undefined,
      responsibleUserId: responsibleUserId || undefined,
      buildingId: buildingId || undefined,
      floorId: floorId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      completionDate: completionDate || undefined,
      progressPercentage,
      status,
      priority: priority && isPriority(priority) ? priority : undefined,
      estimatedCost: toOptionalNumber(estimatedCostRaw),
      dependsOnTaskIds: dependsOnRaw ? dependsOnRaw.split(",").filter(Boolean) : [],
      notes: notes || undefined,
    },
  } as const;
}

export async function createTask(_prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const user = await requireConstructionPermission();

  const parsed = await parseTaskFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await constructionTaskRepository.create({
    id,
    phaseId: fields.phaseId,
    projectId: fields.projectId,
    title: fields.title,
    description: fields.description,
    responsibleUserId: fields.responsibleUserId,
    buildingId: fields.buildingId,
    floorId: fields.floorId,
    startDate: fields.startDate,
    endDate: fields.endDate,
    completionDate: fields.completionDate,
    progressPercentage: fields.progressPercentage,
    status: fields.status,
    priority: fields.priority,
    estimatedCost: fields.estimatedCost !== undefined ? { amount: fields.estimatedCost, currency: "BDT" } : undefined,
    dependsOnTaskIds: fields.dependsOnTaskIds,
    notes: fields.notes,
    photoUrls: [],
    documentIds: [],
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "constructionTask.create", entityType: "ConstructionTask", entityId: id });

  revalidatePath(`/admin/construction/${fields.phaseId}`);
  redirect(`/admin/construction/${fields.phaseId}`);
}

export async function updateTask(id: string, _prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const user = await requireConstructionPermission();

  const parsed = await parseTaskFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await constructionTaskRepository.findById(id);
  if (!existing) return { error: "This task no longer exists." };

  const updated = await constructionTaskRepository.update(id, {
    title: fields.title,
    description: fields.description,
    responsibleUserId: fields.responsibleUserId,
    buildingId: fields.buildingId,
    floorId: fields.floorId,
    startDate: fields.startDate,
    endDate: fields.endDate,
    completionDate: fields.completionDate,
    progressPercentage: fields.progressPercentage,
    status: fields.status,
    priority: fields.priority,
    estimatedCost: fields.estimatedCost !== undefined ? { amount: fields.estimatedCost, currency: "BDT" } : undefined,
    dependsOnTaskIds: fields.dependsOnTaskIds,
    notes: fields.notes,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This task no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "constructionTask.update", entityType: "ConstructionTask", entityId: id });

  revalidatePath(`/admin/construction/${fields.phaseId}`);
  redirect(`/admin/construction/${fields.phaseId}`);
}

export async function deleteTask(phaseId: string, id: string): Promise<void> {
  const user = await requireConstructionPermission();

  const existing = await constructionTaskRepository.findById(id);
  if (!existing) return;

  await constructionTaskRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "constructionTask.delete", entityType: "ConstructionTask", entityId: id });

  revalidatePath(`/admin/construction/${phaseId}`);
}
