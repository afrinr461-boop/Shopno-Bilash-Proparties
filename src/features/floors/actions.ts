"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { floorRepository } from "@/features/floors/repository";
import { buildingRepository } from "@/features/buildings/repository";
import { unitRepository } from "@/features/units/repository";

export interface FloorFormState {
  error?: string;
}

function toOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

async function requireFloorPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "unit.manage")) throw new Error("Forbidden");
  return user;
}

async function parseFloorFields(formData: FormData) {
  const buildingId = String(formData.get("buildingId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const floorNumberRaw = String(formData.get("floorNumber") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!buildingId) return { error: "Choose a building." } as const;
  const building = await buildingRepository.findById(buildingId);
  if (!building) return { error: "That building no longer exists." } as const;
  if (!label) return { error: "Enter a floor label, e.g. \"Floor 1\"." } as const;
  const floorNumber = toOptionalNumber(floorNumberRaw);
  if (floorNumber === undefined) return { error: "Enter a floor number." } as const;

  return { fields: { projectId: building.projectId, buildingId, label, floorNumber, notes: notes || undefined } } as const;
}

export async function createFloor(_prevState: FloorFormState, formData: FormData): Promise<FloorFormState> {
  const user = await requireFloorPermission();

  const parsed = await parseFloorFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await floorRepository.create({
    id,
    projectId: fields.projectId,
    buildingId: fields.buildingId,
    label: fields.label,
    floorNumber: fields.floorNumber,
    unitCount: 0,
    notes: fields.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "floor.create", entityType: "Floor", entityId: id });

  revalidatePath(`/admin/projects/${fields.projectId}/units`);
  return {};
}

export async function updateFloor(id: string, _prevState: FloorFormState, formData: FormData): Promise<FloorFormState> {
  const user = await requireFloorPermission();

  const parsed = await parseFloorFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await floorRepository.findById(id);
  if (!existing) return { error: "This floor no longer exists." };

  await floorRepository.update(id, {
    buildingId: fields.buildingId,
    label: fields.label,
    floorNumber: fields.floorNumber,
    notes: fields.notes,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });

  await recordAuditEvent({ actorUserId: user.id, action: "floor.update", entityType: "Floor", entityId: id });

  revalidatePath(`/admin/projects/${fields.projectId}/units`);
  return {};
}

/** Refuses to delete a floor that still has units — preserves structure/history rather than orphaning `Unit.floorId` references. */
export async function deleteFloor(id: string): Promise<{ error?: string }> {
  const user = await requireFloorPermission();

  const existing = await floorRepository.findById(id);
  if (!existing) return {};

  const units = await unitRepository.list();
  if (units.some((u) => u.floorId === id)) {
    return { error: "This floor still has units — remove them first." };
  }

  await floorRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "floor.delete", entityType: "Floor", entityId: id });

  revalidatePath(`/admin/projects/${existing.projectId}/units`);
  return {};
}
