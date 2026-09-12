import "server-only";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface Attempt {
  count: number;
  windowStart: number;
}

/**
 * In-memory sliding-window limiter, keyed by the submitted email
 * (lowercased) — not by IP, since a shared office/VPN IP shouldn't lock
 * out every real user behind it.
 *
 * ⚠ Documented limitation (brief §20/§36 — do not pretend this is fully
 * solved): this `Map` lives in one server process's memory. It resets on
 * every deploy/restart and is NOT shared across multiple instances or
 * serverless invocations. It stops accidental rapid retries and casual
 * scripted abuse today; it is not a substitute for a shared store (Redis/
 * Upstash) behind a real load balancer in production.
 */
const attempts = new Map<string, Attempt>();

export function isRateLimited(email: string): boolean {
  const key = email.toLowerCase();
  const entry = attempts.get(key);
  if (!entry) return false;

  if (Date.now() - entry.windowStart > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(email: string): void {
  const key = email.toLowerCase();
  const entry = attempts.get(key);
  const now = Date.now();

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
    return;
  }
  entry.count += 1;
}

export function clearAttempts(email: string): void {
  attempts.delete(email.toLowerCase());
}
