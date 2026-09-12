import "server-only";
import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { User } from "@/types/user";
import type { RoleName } from "@/config/roles";

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/**
 * Same `Repository<T>` pattern as every other domain — see
 * `src/lib/prismaRepository.ts`. The bootstrap admin account (see
 * `lib/auth/credentials.ts` for the password half, kept in its own
 * `Credential` table) is inserted once by `prisma/seed.ts`, not by this
 * module — a real database exists now, so there's no need to rebuild it
 * from environment variables on every server start.
 */
export const userRepository: Repository<User> = createPrismaRepository<User>("user");

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await userRepository.list();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

/** Chapter 3 — the portal login's account-identification lookup. Scoped to `roles` (always `PORTAL_ROLES` in practice) so a phone number that happens to match a staff account's `phone` field can never be used to sign in through the owner flow. */
export async function findUserByPhone(phone: string, roles: RoleName[]): Promise<User | null> {
  const target = normalizePhone(phone);
  const users = await userRepository.list();
  return users.find((u) => u.phone && normalizePhone(u.phone) === target && roles.includes(u.role)) ?? null;
}
