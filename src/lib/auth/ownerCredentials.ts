import "server-only";
import { prisma } from "@/lib/db";
import type { ID } from "@/types/common";

/**
 * Chapter 3 — owner/shareholder/landowner portal phone+PIN credentials,
 * the phone-based counterpart of `lib/auth/credentials.ts`'s email+password
 * one. Same separation: a PIN hash never travels through `userRepository`'s
 * normal read path. `findOwnerCredentialsByPhone` returning `null` is how
 * the login flow tells "Pending Activation" (no row yet) apart from
 * "already activated" (a row exists) — see `types/user.ts`'s `User.phone`
 * for the identifying field this is keyed against.
 */
export interface StoredOwnerCredentials {
  userId: ID;
  phone: string;
  /** `scrypt` output from `lib/auth/password.ts` (reused as-is — a 4-digit PIN is just a short secret string to that function), never plaintext. */
  pinHash: string;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export async function findOwnerCredentialsByPhone(phone: string): Promise<StoredOwnerCredentials | null> {
  const row = await prisma.ownerCredential.findUnique({ where: { phone: normalizePhone(phone) } });
  if (!row) return null;
  return { userId: row.userId, phone: row.phone, pinHash: row.pinHash };
}

export async function createOwnerCredential(userId: ID, phone: string, pinHash: string): Promise<void> {
  await prisma.ownerCredential.create({ data: { userId, phone: normalizePhone(phone), pinHash } });
}

export async function updateOwnerCredentialPin(userId: ID, pinHash: string): Promise<void> {
  await prisma.ownerCredential.update({ where: { userId }, data: { pinHash } });
}

/** Admin-assisted reset — deletes the row entirely, so the owner falls back to the first-time activation flow on next login. Never exposes or restores the old PIN. */
export async function deleteOwnerCredential(userId: ID): Promise<void> {
  await prisma.ownerCredential.deleteMany({ where: { userId } });
}

export { normalizePhone };
