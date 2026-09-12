"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { materialThresholdRepository } from "@/features/procurement/repository";

async function requireProcurementPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "procurement.manage")) throw new Error("Forbidden");
  return user;
}

/** Upserts the low-stock threshold for one project+material pair — thresholds are project-scoped since "low" for a small project can be normal for a large one. Pass `minimumStock: undefined`/0-or-less to clear it. */
export async function setMaterialThreshold(projectId: string, materialId: string, minimumStock: number): Promise<{ error?: string }> {
  const user = await requireProcurementPermission();

  if (!Number.isFinite(minimumStock) || minimumStock < 0) return { error: "Enter a valid minimum stock quantity." };

  const existing = (await materialThresholdRepository.list()).find((t) => t.projectId === projectId && t.materialId === materialId);
  const now = new Date().toISOString();

  if (existing) {
    await materialThresholdRepository.update(existing.id, { minimumStock, updatedBy: user.id, updatedAt: now });
  } else {
    await materialThresholdRepository.create({
      id: randomUUID(),
      projectId,
      materialId,
      minimumStock,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
    });
  }

  await recordAuditEvent({ actorUserId: user.id, action: "materialThreshold.set", entityType: "MaterialThreshold", entityId: materialId });

  revalidatePath("/admin/procurement/stock");
  revalidatePath(`/admin/projects/${projectId}/materials`);
  return {};
}
