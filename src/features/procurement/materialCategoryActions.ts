"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { materialCategoryRepository, materialRepository } from "@/features/procurement/repository";
import type { LifecycleStatus } from "@/types/procurement";

export interface MaterialCategoryFormState {
  error?: string;
}

async function requireProcurementPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "procurement.manage")) throw new Error("Forbidden");
  return user;
}

export async function createMaterialCategory(
  _prevState: MaterialCategoryFormState,
  formData: FormData,
): Promise<MaterialCategoryFormState> {
  const user = await requireProcurementPermission();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const defaultUnit = String(formData.get("defaultUnit") ?? "").trim();
  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." };

  const id = randomUUID();
  const now = new Date().toISOString();
  await materialCategoryRepository.create({
    id,
    name,
    description: description || undefined,
    defaultUnit: defaultUnit || undefined,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "materialCategory.create", entityType: "MaterialCategory", entityId: id });

  revalidatePath("/admin/procurement/materials");
  return {};
}

export async function updateMaterialCategory(
  id: string,
  _prevState: MaterialCategoryFormState,
  formData: FormData,
): Promise<MaterialCategoryFormState> {
  const user = await requireProcurementPermission();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const defaultUnit = String(formData.get("defaultUnit") ?? "").trim();
  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." };

  const existing = await materialCategoryRepository.findById(id);
  if (!existing) return { error: "This category no longer exists." };

  await materialCategoryRepository.update(id, {
    name,
    description: description || undefined,
    defaultUnit: defaultUnit || undefined,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });

  await recordAuditEvent({ actorUserId: user.id, action: "materialCategory.update", entityType: "MaterialCategory", entityId: id });

  revalidatePath("/admin/procurement/materials");
  return {};
}

/** Hard delete only when empty — otherwise use `setMaterialCategoryStatus` to retire it. */
export async function deleteMaterialCategory(id: string): Promise<{ error?: string }> {
  const user = await requireProcurementPermission();

  const materials = await materialRepository.list();
  if (materials.some((m) => m.categoryId === id)) {
    return { error: "This category still has materials in it — move or retire those first." };
  }

  await materialCategoryRepository.remove(id);
  await recordAuditEvent({ actorUserId: user.id, action: "materialCategory.delete", entityType: "MaterialCategory", entityId: id });

  revalidatePath("/admin/procurement/materials");
  return {};
}

export async function setMaterialCategoryStatus(id: string, status: LifecycleStatus): Promise<{ error?: string }> {
  const user = await requireProcurementPermission();

  const existing = await materialCategoryRepository.findById(id);
  if (!existing) return { error: "This category no longer exists." };

  await materialCategoryRepository.update(id, { status, updatedBy: user.id, updatedAt: new Date().toISOString() });
  await recordAuditEvent({ actorUserId: user.id, action: "materialCategory.setStatus", entityType: "MaterialCategory", entityId: id });

  revalidatePath("/admin/procurement/materials");
  return {};
}
