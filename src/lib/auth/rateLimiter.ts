import "server-only";
import { prisma } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface Attempt {
  count: number;
  windowStart: number;
}

/**
 * DB-persisted sliding-window limiter, keyed by the submitted email/phone
 * (lowercased) — not by IP, since a shared office/VPN IP shouldn't lock
 * out every real user behind it.
 *
 * Previously an in-memory `Map`, which only worked for a single
 * long-running process — a serverless deploy (Netlify) runs each request
 * on one of several short-lived function instances with no shared memory,
 * so an in-memory counter resets constantly and stops limiting anything.
 * Storing the attempt row in the same database every instance already
 * shares fixes that, at the cost of one extra query per login attempt.
 */
async function readAttempt(key: string): Promise<Attempt | null> {
  const row = await prisma.rateLimitAttempt.findUnique({ where: { id: key } });
  if (!row) return null;
  return row.data as unknown as Attempt;
}

export async function isRateLimited(email: string): Promise<boolean> {
  const key = email.toLowerCase();
  const entry = await readAttempt(key);
  if (!entry) return false;

  if (Date.now() - entry.windowStart > WINDOW_MS) {
    await prisma.rateLimitAttempt.delete({ where: { id: key } }).catch(() => {});
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(email: string): Promise<void> {
  const key = email.toLowerCase();
  const entry = await readAttempt(key);
  const now = Date.now();

  const next: Attempt = !entry || now - entry.windowStart > WINDOW_MS ? { count: 1, windowStart: now } : { count: entry.count + 1, windowStart: entry.windowStart };

  await prisma.rateLimitAttempt.upsert({
    where: { id: key },
    create: { id: key, data: next as object },
    update: { data: next as object },
  });
}

export async function clearAttempts(email: string): Promise<void> {
  await prisma.rateLimitAttempt.delete({ where: { id: email.toLowerCase() } }).catch(() => {});
}
