"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { constructionPhaseRepository, constructionTaskRepository } from "@/features/construction/repository";
import { projectRepository } from "@/features/projects/repository";
import type { ConstructionStatus, ConstructionPriority, ProgressTrackingMethod } from "@/types/construction";

export interface PhaseFormState {
  error?: string;
}

const CONSTRUCTION_STATUSES: ConstructionStatus[] = ["not-started", "planned", "in-progress", "completed", "delayed", "on-hold", "cancelled"];
const PRIORITIES: ConstructionPriority[] = ["low", "medium", "high", "critical"];
const TRACKING_METHODS: ProgressTrackingMethod[] = ["manual", "quantity", "task", "milestone"];

function isConstructionStatus(value: string): value is ConstructionStatus {
  return (CONSTRUCTION_STATUSES as string[]).includes(value);
}
function isPriority(value: string): value is ConstructionPriority {
  return (PRIORITIES as string[]).includes(value);
}
function isTrackingMethod(value: string): value is ProgressTrackingMethod {
  return (TRACKING_METHODS as string[]).includes(value);
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

async function parsePhaseFields(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const orderRaw = String(formData.get("order") ?? "");
  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const actualStartDate = String(formData.get("actualStartDate") ?? "").trim();
  const actualEndDate = String(formData.get("actualEndDate") ?? "").trim();
  const contractorName = String(formData.get("contractorName") ?? "").trim();
  const progressRaw = String(formData.get("progressPercentage") ?? "");
  const status = String(formData.get("status") ?? "");
  const priority = String(formData.get("priority") ?? "");
  const estimatedCostRaw = String(formData.get("estimatedCost") ?? "");
  const weightRaw = String(formData.get("weight") ?? "");
  const trackingMethodRaw = String(formData.get("trackingMethod") ?? "manual");
  const quantityPlannedRaw = String(formData.get("quantityPlanned") ?? "");
  const quantityCompletedRaw = String(formData.get("quantityCompleted") ?? "");
  const buildingId = String(formData.get("buildingId") ?? "").trim();
  const floorId = String(formData.get("floorId") ?? "").trim();
  const unitId = String(formData.get("unitId") ?? "").trim();

  if (!projectId) return { error: "Choose a project." } as const;
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." } as const;
  if (!name) return { error: "Enter a phase name." } as const;
  if (!isConstructionStatus(status)) return { error: "Choose a valid status." } as const;
  if (!isTrackingMethod(trackingMethodRaw)) return { error: "Choose a valid tracking method." } as const;

  const order = toOptionalNumber(orderRaw) ?? 0;
  const progressPercentage = toOptionalNumber(progressRaw) ?? 0;
  if (progressPercentage < 0 || progressPercentage > 100) return { error: "Progress must be between 0 and 100." } as const;

  return {
    fields: {
      projectId,
      name,
      description: description || undefined,
      order,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      actualStartDate: actualStartDate || undefined,
      actualEndDate: actualEndDate || undefined,
      contractorName: contractorName || undefined,
      progressPercentage,
      status,
      priority: priority && isPriority(priority) ? priority : undefined,
      estimatedCost: toOptionalNumber(estimatedCostRaw),
      weight: toOptionalNumber(weightRaw),
      trackingMethod: trackingMethodRaw,
      quantityPlanned: toOptionalNumber(quantityPlannedRaw),
      quantityCompleted: toOptionalNumber(quantityCompletedRaw),
      buildingId: buildingId || undefined,
      floorId: floorId || undefined,
      unitId: unitId || undefined,
    },
  } as const;
}

export async function createPhase(_prevState: PhaseFormState, formData: FormData): Promise<PhaseFormState> {
  const user = await requireConstructionPermission();

  const parsed = await parsePhaseFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await constructionPhaseRepository.create({
    id,
    projectId: fields.projectId,
    name: fields.name,
    description: fields.description,
    order: fields.order,
    startDate: fields.startDate,
    endDate: fields.endDate,
    actualStartDate: fields.actualStartDate,
    actualEndDate: fields.actualEndDate,
    contractorName: fields.contractorName,
    progressPercentage: fields.progressPercentage,
    status: fields.status,
    priority: fields.priority,
    estimatedCost: fields.estimatedCost !== undefined ? { amount: fields.estimatedCost, currency: "BDT" } : undefined,
    weight: fields.weight,
    trackingMethod: fields.trackingMethod,
    quantityPlanned: fields.quantityPlanned,
    quantityCompleted: fields.quantityCompleted,
    buildingId: fields.buildingId,
    floorId: fields.floorId,
    unitId: fields.unitId,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "constructionPhase.create", entityType: "ConstructionPhase", entityId: id });

  revalidatePath("/admin/construction");
  redirect("/admin/construction");
}

export async function updatePhase(id: string, _prevState: PhaseFormState, formData: FormData): Promise<PhaseFormState> {
  const user = await requireConstructionPermission();

  const parsed = await parsePhaseFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await constructionPhaseRepository.findById(id);
  if (!existing) return { error: "This phase no longer exists." };

  const updated = await constructionPhaseRepository.update(id, {
    projectId: fields.projectId,
    name: fields.name,
    description: fields.description,
    order: fields.order,
    startDate: fields.startDate,
    endDate: fields.endDate,
    actualStartDate: fields.actualStartDate,
    actualEndDate: fields.actualEndDate,
    contractorName: fields.contractorName,
    progressPercentage: fields.progressPercentage,
    status: fields.status,
    priority: fields.priority,
    estimatedCost: fields.estimatedCost !== undefined ? { amount: fields.estimatedCost, currency: "BDT" } : undefined,
    weight: fields.weight,
    trackingMethod: fields.trackingMethod,
    quantityPlanned: fields.quantityPlanned,
    quantityCompleted: fields.quantityCompleted,
    buildingId: fields.buildingId,
    floorId: fields.floorId,
    unitId: fields.unitId,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This phase no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "constructionPhase.update", entityType: "ConstructionPhase", entityId: id });

  revalidatePath("/admin/construction");
  revalidatePath(`/admin/construction/${id}`);
  redirect(`/admin/construction/${id}`);
}

/** Hard delete only when the phase has no tasks — historical construction records should prefer status "cancelled" once anything real is attached. */
export async function deletePhase(id: string): Promise<{ error?: string }> {
  const user = await requireConstructionPermission();

  const existing = await constructionPhaseRepository.findById(id);
  if (!existing) return {};

  const tasks = await constructionTaskRepository.list();
  if (tasks.some((t) => t.phaseId === id)) {
    return { error: "This phase still has tasks — remove or reassign those first, or set status to Cancelled instead." };
  }

  await constructionPhaseRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "constructionPhase.delete", entityType: "ConstructionPhase", entityId: id });

  revalidatePath("/admin/construction");
  return {};
}
