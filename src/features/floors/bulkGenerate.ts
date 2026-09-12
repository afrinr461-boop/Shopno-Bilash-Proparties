"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { floorRepository } from "@/features/floors/repository";
import { unitRepository } from "@/features/units/repository";
import { buildingRepository } from "@/features/buildings/repository";

export interface BulkGenerateFormState {
  error?: string;
  createdFloors?: number;
  createdUnits?: number;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** "A/B/C" naming: 0→A, 1→B, … 25→Z, 26→AA, etc. Small buildings only ever need single letters, but this doesn't fall over past 26. */
function letterSuffix(index: number): string {
  let n = index;
  let out = "";
  do {
    out = ALPHABET[n % 26] + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

async function requireFloorPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "unit.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * A convenience generator, not an enforced structure — every Floor/Unit it
 * creates is a normal, freely editable record afterward (rename, resize,
 * delete individually). Real buildings are irregular, so this only saves
 * the repetitive part of a *typical* case; it never assumes every floor
 * ends up looking the same.
 */
export async function generateFloorsAndUnits(
  _prevState: BulkGenerateFormState,
  formData: FormData,
): Promise<BulkGenerateFormState> {
  const user = await requireFloorPermission();

  const buildingId = String(formData.get("buildingId") ?? "").trim();
  const floorCount = Number(formData.get("floorCount") ?? 0);
  const unitsPerFloor = Number(formData.get("unitsPerFloor") ?? 0);
  const namingPattern = String(formData.get("namingPattern") ?? "letters"); // "letters" | "numbers"
  const startFloorNumber = Number(formData.get("startFloorNumber") ?? 1);

  if (!buildingId) return { error: "Choose a building." };
  const building = await buildingRepository.findById(buildingId);
  if (!building) return { error: "That building no longer exists." };
  if (!Number.isFinite(floorCount) || floorCount < 1 || floorCount > 100) {
    return { error: "Enter a floor count between 1 and 100." };
  }
  if (!Number.isFinite(unitsPerFloor) || unitsPerFloor < 1 || unitsPerFloor > 50) {
    return { error: "Enter a unit-per-floor count between 1 and 50." };
  }

  const now = new Date().toISOString();
  let createdFloors = 0;
  let createdUnits = 0;

  for (let i = 0; i < floorCount; i++) {
    const floorNumber = startFloorNumber + i;
    const floorId = randomUUID();
    await floorRepository.create({
      id: floorId,
      projectId: building.projectId,
      buildingId,
      label: `Floor ${floorNumber}`,
      floorNumber,
      unitCount: unitsPerFloor,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
    });
    createdFloors += 1;

    for (let u = 0; u < unitsPerFloor; u++) {
      const suffix = namingPattern === "numbers" ? String(u + 1) : letterSuffix(u);
      await unitRepository.create({
        id: randomUUID(),
        projectId: building.projectId,
        buildingId,
        floorId,
        unitNumber: `${floorNumber}${suffix}`,
        sizeSqft: 0,
        bedrooms: 0,
        bathrooms: 0,
        balconies: 0,
        parkingSpaces: 0,
        basePrice: { amount: 0, currency: "BDT" },
        additionalCharges: { amount: 0, currency: "BDT" },
        discount: { amount: 0, currency: "BDT" },
        finalPrice: { amount: 0, currency: "BDT" },
        status: "available",
        createdAt: now,
        updatedAt: now,
        createdBy: user.id,
      });
      createdUnits += 1;
    }
  }

  await recordAuditEvent({
    actorUserId: user.id,
    action: "floor.bulkGenerate",
    entityType: "Building",
    entityId: buildingId,
  });

  revalidatePath(`/admin/projects/${building.projectId}/units`);
  return { createdFloors, createdUnits };
}
