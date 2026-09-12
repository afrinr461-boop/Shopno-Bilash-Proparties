import "server-only";
import { unitRepository } from "@/features/units/repository";
import { userRepository } from "@/features/users/repository";
import { customerRepository } from "@/features/customers/repository";
import { shareholderRepository } from "@/features/shareholders/repository";
import { landownerRepository } from "@/features/landowners/repository";
import { resolveUnitOwner } from "@/features/ownership/resolveUnitOwner";
import type { OwnerType } from "@/types/finance/costAllocation";
import type { ID } from "@/types/common";

export interface ProjectOwnerRecipient {
  userId: ID;
  ownerType: OwnerType;
  ownerId: ID;
  name: string;
}

export interface ProjectOwnerSummary {
  recipients: ProjectOwnerRecipient[];
  /** Real owners of a unit in this project who have no linked, active portal account yet — skipped, never silently miscounted as sent. */
  unreachableCount: number;
}

const LINKED_FIELD_BY_TYPE: Record<OwnerType, "linkedCustomerId" | "linkedShareholderId" | "linkedLandownerId"> = {
  customer: "linkedCustomerId",
  shareholder: "linkedShareholderId",
  landowner: "linkedLandownerId",
};

/**
 * Every distinct owner (customer/shareholder/landowner) of a unit in
 * `projectId`, resolved down to the portal `User` they'd actually be
 * notified as. Reuses the same `resolveUnitOwner` fast-path fields and
 * `linkedCustomerId`/`linkedShareholderId`/`linkedLandownerId` matching
 * `getOwnerNotifications` (`features/ownerPortal/queries.ts`) already does,
 * so "who owns a unit here" and "who gets notified" never drift into two
 * different answers.
 */
export async function getProjectOwnerRecipients(projectId: string): Promise<ProjectOwnerSummary> {
  const [units, users, customers, shareholders, landowners] = await Promise.all([
    unitRepository.list(),
    userRepository.list(),
    customerRepository.list(),
    shareholderRepository.list(),
    landownerRepository.list(),
  ]);

  const projectUnits = units.filter((u) => u.projectId === projectId);
  const ownerRefs = await Promise.all(projectUnits.map((u) => resolveUnitOwner(u)));

  const distinctOwners = new Map<string, { ownerType: OwnerType; ownerId: string }>();
  for (const ref of ownerRefs) {
    if (!ref) continue;
    distinctOwners.set(`${ref.ownerType}:${ref.ownerId}`, ref);
  }

  const namesByType: Record<OwnerType, Map<string, string>> = {
    customer: new Map(customers.map((c) => [c.id, c.name])),
    shareholder: new Map(shareholders.map((s) => [s.id, s.name])),
    landowner: new Map(landowners.map((l) => [l.id, l.name])),
  };

  const recipients: ProjectOwnerRecipient[] = [];
  let unreachableCount = 0;

  for (const owner of distinctOwners.values()) {
    const field = LINKED_FIELD_BY_TYPE[owner.ownerType];
    const linkedUser = users.find((u) => u[field] === owner.ownerId && u.status === "active");
    if (!linkedUser) {
      unreachableCount += 1;
      continue;
    }
    recipients.push({
      userId: linkedUser.id,
      ownerType: owner.ownerType,
      ownerId: owner.ownerId,
      name: namesByType[owner.ownerType].get(owner.ownerId) ?? "Unknown owner",
    });
  }

  return { recipients, unreachableCount };
}
