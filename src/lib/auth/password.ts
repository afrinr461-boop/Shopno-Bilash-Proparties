import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/**
 * Password hashing — Node's built-in `scrypt` (memory-hard, no extra
 * dependency needed) rather than bcrypt/argon2, since the project has zero
 * runtime dependencies for this today and scrypt is a modern, recommended
 * KDF already in the standard library. Server-only: `node:crypto` isn't
 * available in the Edge runtime, so this must never be imported from
 * `middleware.ts` (that file only verifies session tokens via `jose`).
 *
 * Stored format: `<saltHex>:<hashHex>` — self-describing, so the salt
 * never needs a separate column/field.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scryptAsync(plainPassword, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

/** Timing-safe comparison — never a plain `===` on secret material. */
export async function verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = (await scryptAsync(plainPassword, salt, KEY_LENGTH)) as Buffer;

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
