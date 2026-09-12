import type { AuditFields, ID, Money } from "./common";
import type { OwnerType } from "./finance/costAllocation";

export type ParkingStatus = "available" | "assigned" | "reserved" | "unavailable";
export type ParkingType = "car" | "bike" | "reserved-visitor";

/**
 * A separate entity from Unit, on purpose — a flat owner may have zero,
 * one, or several parking spaces, and a parking space's owner can be a
 * completely different person than any flat's owner. `ownerType`/`ownerId`
 * is the same fast-path "current owner" pattern `Unit` uses, kept
 * independent of any unit link. History lives in `OwnershipRecord`
 * (`targetType: "parking"`), same table Units use.
 */
export interface Parking extends AuditFields {
  id: ID;
  projectId: ID;
  /** Optional — some parking (e.g. a shared basement) isn't tied to one building. */
  buildingId?: ID;
  parkingNumber: string;
  zone?: string;
  type?: ParkingType;
  status: ParkingStatus;
  ownerType?: OwnerType;
  ownerId?: ID;
  value?: Money;
  notes?: string;
}
