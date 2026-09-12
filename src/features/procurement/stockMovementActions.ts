"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { stockMovementRepository, materialRepository } from "@/features/procurement/repository";
import { projectRepository } from "@/features/projects/repository";
import { currentStockOf } from "@/lib/materialStock";
import type { StockMovementType } from "@/types/procurement";

export interface StockMovementFormState {
  error?: string;
}

const MOVEMENT_TYPES: StockMovementType[] = ["opening", "received", "used", "wastage", "adjustment"];
function isMovementType(value: string): value is StockMovementType {
  return (MOVEMENT_TYPES as string[]).includes(value);
}

async function requireProcurementPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "procurement.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * A movement is never edited after the fact — only created or (if it was a
 * genuine mistake) deleted — so the ledger stays an honest history, the
 * same reasoning `recordAuditEvent` is append-only for.
 */
export async function createStockMovement(
  _prevState: StockMovementFormState,
  formData: FormData,
): Promise<StockMovementFormState> {
  const user = await requireProcurementPermission();

  const projectId = String(formData.get("projectId") ?? "").trim();
  const materialId = String(formData.get("materialId") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const quantityRaw = String(formData.get("quantity") ?? "");
  const date = String(formData.get("date") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "").trim();
  const floorId = String(formData.get("floorId") ?? "").trim();
  const unitId = String(formData.get("unitId") ?? "").trim();
  const constructionPhaseId = String(formData.get("constructionPhaseId") ?? "").trim();
  const activity = String(formData.get("activity") ?? "").trim();
  const contractorTeam = String(formData.get("contractorTeam") ?? "").trim();

  if (!projectId) return { error: "Choose a project." };
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." };

  if (!materialId) return { error: "Choose a material." };
  const material = await materialRepository.findById(materialId);
  if (!material) return { error: "That material no longer exists." };

  if (!isMovementType(type)) return { error: "Choose a valid movement type." };

  const quantity = Number(quantityRaw);
  if (!Number.isFinite(quantity) || quantity === 0) return { error: "Enter a non-zero quantity." };
  if (type !== "adjustment" && quantity < 0) {
    return { error: "Only an Adjustment can be negative — enter a positive quantity for this type." };
  }

  if (!date) return { error: "Enter a date." };

  if (type === "used" || type === "wastage") {
    const existingMovements = (await stockMovementRepository.list()).filter(
      (m) => m.projectId === projectId && m.materialId === materialId,
    );
    const currentStock = currentStockOf(existingMovements);
    if (quantity > currentStock) {
      return {
        error: `Insufficient stock — ${material.name} has ${currentStock} ${material.unit} available in this project, but ${quantity} was requested. Stock can never go negative.`,
      };
    }
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await stockMovementRepository.create({
    id,
    projectId,
    materialId,
    type,
    quantity,
    date,
    reference: reference || undefined,
    notes: notes || undefined,
    buildingId: type === "used" || type === "wastage" ? buildingId || undefined : undefined,
    floorId: type === "used" || type === "wastage" ? floorId || undefined : undefined,
    unitId: type === "used" || type === "wastage" ? unitId || undefined : undefined,
    constructionPhaseId: type === "used" || type === "wastage" ? constructionPhaseId || undefined : undefined,
    activity: type === "used" || type === "wastage" ? activity || undefined : undefined,
    contractorTeam: type === "used" || type === "wastage" ? contractorTeam || undefined : undefined,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "stockMovement.create", entityType: "StockMovement", entityId: id });

  revalidatePath("/admin/procurement/stock");
  redirect(`/admin/procurement/stock?projectId=${projectId}`);
}

export async function deleteStockMovement(id: string): Promise<{ error?: string }> {
  const user = await requireProcurementPermission();

  const existing = await stockMovementRepository.findById(id);
  if (!existing) return {};
  if (existing.purchaseId) return { error: "This movement was created by a purchase receipt and can't be deleted on its own." };

  await stockMovementRepository.remove(id);
  await recordAuditEvent({ actorUserId: user.id, action: "stockMovement.delete", entityType: "StockMovement", entityId: id });

  revalidatePath("/admin/procurement/stock");
  return {};
}
