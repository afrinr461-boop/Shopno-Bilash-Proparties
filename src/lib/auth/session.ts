import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { RoleName } from "@/config/roles";
import type { ID } from "@/types/common";

export const SESSION_COOKIE_NAME = "sbp_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload extends JWTPayload {
  sub: ID;
  role: RoleName;
}

/**
 * Signed, stateless session tokens via `jose` — chosen specifically because
 * it works identically in the Node runtime (Server Actions, route
 * handlers) and the Edge runtime (`middleware.ts`), unlike Node's built-in
 * `crypto` (used for password hashing instead, which never needs to run in
 * middleware). The token carries only `sub` (user id) and `role` — never a
 * name/email/anything that shouldn't survive a role change until the
 * session is refreshed, and never the password hash.
 *
 * `AUTH_SECRET` has no fallback value on purpose (see the thrown error
 * below) — a hardcoded fallback would itself be a secret committed to
 * source, which is exactly what this file must never do.
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is not set (or is shorter than 32 characters). Set it in .env.local — see .env.example.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: { userId: ID; role: RoleName }): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

/** Returns `null` on any verification failure (expired, tampered, malformed) — callers never need to distinguish why. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.role !== "string") return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
