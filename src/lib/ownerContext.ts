import "server-only";
import type { User } from "@/types/user";
import type { OwnerType } from "@/types/finance/costAllocation";

export interface OwnerContext {
  ownerType: OwnerType;
  ownerId: string;
}

/**
 * Chapter 3 — every portal page needs the same "which owner record does
 * this logged-in User actually represent" resolution before it can call
 * `features/ownerPortal/queries.ts`. One place for it, since a signed-in
 * `User` with role "customer"/"shareholder"/"landowner" but no matching
 * `linkedXId` (set up incorrectly, or portal access granted before the
 * link was made) must read as "no property linked yet", never crash or
 * silently resolve to someone else's data.
 */
export function resolveOwnerContext(user: User): OwnerContext | null {
  if (user.role === "customer" && user.linkedCustomerId) return { ownerType: "customer", ownerId: user.linkedCustomerId };
  if (user.role === "shareholder" && user.linkedShareholderId) return { ownerType: "shareholder", ownerId: user.linkedShareholderId };
  if (user.role === "landowner" && user.linkedLandownerId) return { ownerType: "landowner", ownerId: user.linkedLandownerId };
  return null;
}
