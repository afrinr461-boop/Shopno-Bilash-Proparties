"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { parkingRepository } from "@/features/parking/repository";
import { projectRepository } from "@/features/projects/repository";
import type { ParkingType } from "@/types/parking";

export interface BulkParkingFormState {
  error?: string;
  createdParking?: number;
}

const PARKING_TYPES: ParkingType[] = ["car", "bike", "reserved-visitor"];
function isParkingType(value: string): value is ParkingType {
  return (PARKING_TYPES as string[]).includes(value);
}

async function requireParkingManage() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "parking.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * A convenience generator, not an enforced structure — mirrors
 * `generateFloorsAndUnits`'s own philosophy exactly: every Parking row it
 * creates is a normal, freely editable "shell" record afterward (rename,
 * assign an owner, delete individually). `buildingId` is optional here too,
 * same as a real Parking record — many projects' parking isn't tied to one
 * building.
 */
export async function generateParkingSpaces(
  _prevState: BulkParkingFormState,
  formData: FormData,
): Promise<BulkParkingFormState> {
  const user = await requireParkingManage();

  const projectId = String(formData.get("projectId") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "").trim();
  const count = Number(formData.get("count") ?? 0);
  const prefix = String(formData.get("prefix") ?? "P").trim() || "P";
  const startNumber = Number(formData.get("startNumber") ?? 1);
  const typeRaw = String(formData.get("type") ?? "").trim();
  const type = isParkingType(typeRaw) ? typeRaw : undefined;

  if (!projectId) return { error: "Choose a project." };
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." };
  if (!Number.isFinite(count) || count < 1 || count > 200) {
    return { error: "Enter a count between 1 and 200." };
  }
  if (!Number.isFinite(startNumber) || startNumber < 1) {
    return { error: "Enter a valid starting number." };
  }

  const existing = (await parkingRepository.list()).filter((p) => p.projectId === projectId);
  const existingNumbers = new Set(existing.map((p) => p.parkingNumber));

  const now = new Date().toISOString();
  let createdParking = 0;

  for (let i = 0; i < count; i++) {
    const n = startNumber + i;
    const parkingNumber = `${prefix}-${String(n).padStart(2, "0")}`;
    if (existingNumbers.has(parkingNumber)) continue; // never silently overwrite/duplicate an existing number

    await parkingRepository.create({
      id: randomUUID(),
      projectId,
      buildingId: buildingId || undefined,
      parkingNumber,
      type,
      status: "available",
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
    });
    createdParking += 1;
  }

  await recordAuditEvent({ actorUserId: user.id, action: "parking.bulkGenerate", entityType: "Project", entityId: projectId });

  revalidatePath("/admin/parking");
  revalidatePath(`/admin/projects/${projectId}/parking`);
  return { createdParking };
}
