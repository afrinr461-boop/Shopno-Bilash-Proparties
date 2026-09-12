"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { materialRepository, materialCategoryRepository, stockMovementRepository, purchaseRepository } from "@/features/procurement/repository";
import type { LifecycleStatus } from "@/types/procurement";

export interface MaterialFormState {
  error?: string;
}

async function requireProcurementPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "procurement.manage")) throw new Error("Forbidden");
  return user;
}

async function parseMaterialFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const specification = String(formData.get("specification") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const defaultPriceRaw = String(formData.get("defaultPrice") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." } as const;
  if (!categoryId) return { error: "Choose a category." } as const;
  const category = await materialCategoryRepository.findById(categoryId);
  if (!category) return { error: "That category no longer exists." } as const;
  if (!unit) return { error: "Enter a unit, e.g. \"bag\" or \"ton\"." } as const;

  const defaultPrice = defaultPriceRaw.trim() ? Number(defaultPriceRaw) : undefined;
  if (defaultPrice !== undefined && (!Number.isFinite(defaultPrice) || defaultPrice < 0)) {
    return { error: "Enter a valid reference price, or leave it blank." } as const;
  }

  return {
    fields: {
      name,
      categoryId,
      unit,
      brand: brand || undefined,
      specification: specification || undefined,
      grade: grade || undefined,
      description: description || undefined,
      defaultPrice,
      notes: notes || undefined,
    },
  } as const;
}

export async function createMaterial(_prevState: MaterialFormState, formData: FormData): Promise<MaterialFormState> {
  const user = await requireProcurementPermission();

  const parsed = await parseMaterialFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();
  await materialRepository.create({
    id,
    name: fields.name,
    categoryId: fields.categoryId,
    unit: fields.unit,
    brand: fields.brand,
    specification: fields.specification,
    grade: fields.grade,
    description: fields.description,
    defaultPrice: fields.defaultPrice !== undefined ? { amount: fields.defaultPrice, currency: "BDT" } : undefined,
    notes: fields.notes,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "material.create", entityType: "Material", entityId: id });

  revalidatePath("/admin/procurement/materials");
  redirect("/admin/procurement/materials");
}

export async function updateMaterial(id: string, _prevState: MaterialFormState, formData: FormData): Promise<MaterialFormState> {
  const user = await requireProcurementPermission();

  const parsed = await parseMaterialFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await materialRepository.findById(id);
  if (!existing) return { error: "This material no longer exists." };

  const updated = await materialRepository.update(id, {
    name: fields.name,
    categoryId: fields.categoryId,
    unit: fields.unit,
    brand: fields.brand,
    specification: fields.specification,
    grade: fields.grade,
    description: fields.description,
    defaultPrice: fields.defaultPrice !== undefined ? { amount: fields.defaultPrice, currency: "BDT" } : undefined,
    notes: fields.notes,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This material no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "material.update", entityType: "Material", entityId: id });

  revalidatePath("/admin/procurement/materials");
  redirect("/admin/procurement/materials");
}

/** Hard delete only when nothing references it yet — otherwise use `setMaterialStatus` to retire it without losing history. */
export async function deleteMaterial(id: string): Promise<{ error?: string }> {
  const user = await requireProcurementPermission();

  const [movements, purchases] = await Promise.all([stockMovementRepository.list(), purchaseRepository.list()]);
  if (movements.some((m) => m.materialId === id) || purchases.some((p) => p.materialId === id)) {
    return { error: "This material has purchase or stock history — set it to Inactive instead of deleting." };
  }

  await materialRepository.remove(id);
  await recordAuditEvent({ actorUserId: user.id, action: "material.delete", entityType: "Material", entityId: id });

  revalidatePath("/admin/procurement/materials");
  return {};
}

export async function setMaterialStatus(id: string, status: LifecycleStatus): Promise<{ error?: string }> {
  const user = await requireProcurementPermission();

  const existing = await materialRepository.findById(id);
  if (!existing) return { error: "This material no longer exists." };

  await materialRepository.update(id, { status, updatedBy: user.id, updatedAt: new Date().toISOString() });
  await recordAuditEvent({ actorUserId: user.id, action: "material.setStatus", entityType: "Material", entityId: id });

  revalidatePath("/admin/procurement/materials");
  revalidatePath(`/admin/procurement/materials/${id}`);
  return {};
}
