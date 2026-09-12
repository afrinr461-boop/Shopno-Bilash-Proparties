"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { userRepository } from "@/features/users/repository";
import { deleteOwnerCredential } from "@/lib/auth/ownerCredentials";
import { customerRepository } from "@/features/customers/repository";
import { shareholderRepository } from "@/features/shareholders/repository";
import { landownerRepository } from "@/features/landowners/repository";
import type { OwnerType } from "@/types/finance/costAllocation";
import type { ID } from "@/types/common";
import type { User } from "@/types/user";

async function requireUsersManagePermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "users.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * Chapter 3 — the admin-side half of "grant portal access." Reuses the
 * existing Customer/Shareholder/Landowner record as the source of truth
 * for name/email/phone (never invents a synthetic one) and links the two
 * records both ways (`User.linkedXId` and `<Owner>.userId`), the same
 * relationship `types/customer.ts` already documented as designed-for.
 * Does NOT create an `OwnerCredential` row — that only ever happens when
 * the owner themselves completes first-time PIN activation
 * (`lib/auth/ownerActions.ts`), so a granted-but-never-logged-in account
 * correctly reads as "Pending Activation".
 */
export async function grantPortalAccess(ownerType: OwnerType, ownerId: ID): Promise<{ error?: string; userId?: string }> {
  const admin = await requireUsersManagePermission();

  const repo = ownerType === "customer" ? customerRepository : ownerType === "shareholder" ? shareholderRepository : landownerRepository;
  const owner = await repo.findById(ownerId);
  if (!owner) return { error: "This record no longer exists." };
  if (owner.userId) return { userId: owner.userId };

  if (!owner.email) return { error: "This record has no email on file — add one before granting portal access." };
  if (!owner.phone) return { error: "This record has no phone number on file — add one before granting portal access." };

  const existingByEmail = (await userRepository.list()).find((u) => u.email.toLowerCase() === owner.email.toLowerCase());
  if (existingByEmail) return { error: "A user account with this email already exists." };

  const id = randomUUID();
  const now = new Date().toISOString();
  const linkField: Partial<User> =
    ownerType === "customer"
      ? { linkedCustomerId: ownerId }
      : ownerType === "shareholder"
        ? { linkedShareholderId: ownerId }
        : { linkedLandownerId: ownerId };

  await userRepository.create({
    id,
    name: owner.name,
    email: owner.email,
    phone: owner.phone,
    role: ownerType,
    status: "invited",
    ...linkField,
    createdAt: now,
    updatedAt: now,
    createdBy: admin.id,
  });

  await repo.update(ownerId, { userId: id, updatedBy: admin.id, updatedAt: now });

  await recordAuditEvent({ actorUserId: admin.id, action: "portal.access.grant", entityType: "User", entityId: id });

  revalidatePath(`/admin/${ownerType === "customer" ? "customers" : ownerType === "shareholder" ? "shareholders" : "landowners"}/${ownerId}`);
  revalidatePath("/admin/users");
  return { userId: id };
}

/**
 * Admin-assisted PIN reset (Prompt 1 §"Admin should NOT be able to view
 * the owner's existing PIN"). Deletes the `OwnerCredential` row outright —
 * there is no "old PIN" to invalidate-in-place, only a fresh activation
 * to require. Always recorded in the Audit Log (Chapter 2's own, not a
 * separate portal log) with the admin as actor and the reason, if given.
 */
export async function resetOwnerPortalAccess(userId: ID, reason?: string): Promise<{ error?: string }> {
  const admin = await requireUsersManagePermission();

  const owner = await userRepository.findById(userId);
  if (!owner) return { error: "This user no longer exists." };

  await deleteOwnerCredential(userId);

  const now = new Date().toISOString();
  if (owner.status === "active") {
    await userRepository.update(userId, { status: "invited", updatedBy: admin.id, updatedAt: now });
  }

  await recordAuditEvent({
    actorUserId: admin.id,
    action: "portal.access.reset",
    entityType: "User",
    entityId: userId,
    newValue: reason ? { reason } : undefined,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return {};
}
