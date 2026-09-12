import "server-only";
import { prisma } from "@/lib/db";
import type { ID } from "@/types/common";

/**
 * Real, server-side credential verification, now backed by the real
 * database's `Credential` table (`prisma/schema.prisma`) instead of an
 * environment-variable-only bootstrap account. Kept as its own table
 * (rather than a field on `User`) so a password hash never travels through
 * `userRepository`'s normal read path — see `getCurrentUser()` in
 * `lib/auth.ts`, which never touches this file at all.
 *
 * The one bootstrap account is still sourced from `ADMIN_BOOTSTRAP_EMAIL`/
 * `ADMIN_BOOTSTRAP_PASSWORD_HASH` (see `.env.example`) — `prisma/seed.ts`
 * reads those same two variables once, at seed time, to insert the row
 * this file now queries. `getBootstrapCredentials()` below is exported
 * for exactly that one caller (the seed script); nothing at request time
 * uses it — `findCredentialsByEmail` is the only function the login
 * action calls.
 *
 * `import "server-only"` makes this a hard build error if anything ever
 * imports it from a Client Component — the password hash must never reach
 * a browser bundle.
 */
export interface StoredCredentials {
  userId: ID;
  email: string;
  /** `scrypt` output from `lib/auth/password.ts`, never a plaintext password. */
  passwordHash: string;
}

export function getBootstrapCredentials(): { email: string; passwordHash: string } | null {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const passwordHash = process.env.ADMIN_BOOTSTRAP_PASSWORD_HASH;
  if (!email || !passwordHash) return null;

  return { email: email.toLowerCase(), passwordHash };
}

export async function findCredentialsByEmail(email: string): Promise<StoredCredentials | null> {
  const row = await prisma.credential.findUnique({ where: { email: email.toLowerCase() } });
  if (!row) return null;

  return { userId: row.userId, email: row.email, passwordHash: row.passwordHash };
}
