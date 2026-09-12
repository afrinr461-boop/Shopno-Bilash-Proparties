"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { buildingRepository } from "@/features/buildings/repository";
import { floorRepository } from "@/features/floors/repository";
import { projectRepository } from "@/features/projects/repository";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/fileStorage";
import type { BuildingStatus } from "@/types/project";

export interface BuildingFormState {
  error?: string;
}

const BUILDING_STATUSES: BuildingStatus[] = ["planning", "under-construction", "completed"];

function isBuildingStatus(value: string): value is BuildingStatus {
  return (BUILDING_STATUSES as string[]).includes(value);
}

function toOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function getUploadedFile(formData: FormData, field: string): File | null {
  const file = formData.get(field);
  return file instanceof File && file.size > 0 ? file : null;
}

function getUploadedFiles(formData: FormData, field: string): File[] {
  return formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
}

async function requireBuildingPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "unit.manage")) throw new Error("Forbidden");
  return user;
}

async function parseBuildingFields(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const floorCountRaw = String(formData.get("floorCount") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!projectId) return { error: "Choose a project." } as const;
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." } as const;
  if (!name) return { error: "Enter a building name." } as const;
  if (!isBuildingStatus(status)) return { error: "Choose a valid status." } as const;

  return {
    fields: {
      projectId,
      name,
      code: code || undefined,
      status,
      floorCount: toOptionalNumber(floorCountRaw) ?? 0,
      notes: notes || undefined,
    },
  } as const;
}

export async function createBuilding(_prevState: BuildingFormState, formData: FormData): Promise<BuildingFormState> {
  const user = await requireBuildingPermission();

  const parsed = await parseBuildingFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const coverFile = getUploadedFile(formData, "coverImage");
  const galleryFiles = getUploadedFiles(formData, "gallery");

  let coverImage: string | undefined;
  let gallery: string[] = [];
  try {
    if (coverFile) coverImage = (await saveUploadedFile(coverFile, "buildings")).url;
    if (galleryFiles.length > 0) {
      gallery = (await Promise.all(galleryFiles.map((f) => saveUploadedFile(f, "buildings")))).map((f) => f.url);
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save the uploaded image(s)." };
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await buildingRepository.create({
    id,
    projectId: fields.projectId,
    name: fields.name,
    code: fields.code,
    status: fields.status,
    floorCount: fields.floorCount,
    coverImage,
    gallery,
    notes: fields.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "building.create", entityType: "Building", entityId: id });

  revalidatePath(`/admin/projects/${fields.projectId}/units`);
  return {};
}

export async function updateBuilding(id: string, _prevState: BuildingFormState, formData: FormData): Promise<BuildingFormState> {
  const user = await requireBuildingPermission();

  const parsed = await parseBuildingFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await buildingRepository.findById(id);
  if (!existing) return { error: "This building no longer exists." };

  const coverFile = getUploadedFile(formData, "coverImage");
  const galleryFiles = getUploadedFiles(formData, "gallery");

  let coverImage = existing.coverImage;
  let gallery = existing.gallery;
  try {
    if (coverFile) {
      const saved = await saveUploadedFile(coverFile, "buildings");
      if (existing.coverImage) await deleteUploadedFile(existing.coverImage);
      coverImage = saved.url;
    }
    if (galleryFiles.length > 0) {
      const saved = await Promise.all(galleryFiles.map((f) => saveUploadedFile(f, "buildings")));
      gallery = [...existing.gallery, ...saved.map((f) => f.url)];
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save the uploaded image(s)." };
  }

  await buildingRepository.update(id, {
    name: fields.name,
    code: fields.code,
    status: fields.status,
    floorCount: fields.floorCount,
    coverImage,
    gallery,
    notes: fields.notes,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });

  await recordAuditEvent({ actorUserId: user.id, action: "building.update", entityType: "Building", entityId: id });

  revalidatePath(`/admin/projects/${fields.projectId}/units`);
  return {};
}

/** Refuses to delete a building that still has floors — preserves structure/history rather than orphaning `Floor.buildingId` references. */
export async function deleteBuilding(id: string): Promise<{ error?: string }> {
  const user = await requireBuildingPermission();

  const existing = await buildingRepository.findById(id);
  if (!existing) return {};

  const floors = await floorRepository.list();
  if (floors.some((f) => f.buildingId === id)) {
    return { error: "This building still has floors — remove them first." };
  }

  await buildingRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "building.delete", entityType: "Building", entityId: id });

  revalidatePath(`/admin/projects/${existing.projectId}/units`);
  return {};
}
