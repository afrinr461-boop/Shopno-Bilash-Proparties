import "server-only";
import { landownerAllocationRepository } from "@/features/landowners/repository";
import type { Unit } from "@/types/unit";
import type { OwnerType } from "@/types/finance/costAllocation";

export interface UnitOwnerRef {
  ownerType: OwnerType;
  ownerId: string;
}

/**
 * Bridges `Unit`'s three mutually-exclusive fast-path owner fields to the
 * generic `OwnerType`/`ownerId` pair the rest of the ownership system
 * (`OwnershipRecord`, `resolveDocumentOwner`, `Parking`) speaks. Only
 * `landownerAllocationId` needs an extra lookup — it points at a
 * `LandownerAllocation` row, not the landowner directly.
 */
export async function resolveUnitOwner(unit: Unit): Promise<UnitOwnerRef | undefined> {
  if (unit.customerId) return { ownerType: "customer", ownerId: unit.customerId };
  if (unit.shareholderId) return { ownerType: "shareholder", ownerId: unit.shareholderId };
  if (unit.landownerAllocationId) {
    const allocation = await landownerAllocationRepository.findById(unit.landownerAllocationId);
    if (allocation) return { ownerType: "landowner", ownerId: allocation.landownerId };
  }
  return undefined;
}
