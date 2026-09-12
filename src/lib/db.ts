import "server-only";
import { PrismaClient } from "@prisma/client";

/**
 * Standard Next.js dev-mode singleton: without this, every hot-reload of a
 * file that imports `prisma` would construct a brand new `PrismaClient`
 * (and open a brand new SQLite connection) on top of the last one, until
 * the dev server eventually runs out of file handles. Production runs one
 * server process per request lifecycle anyway, so this is a no-op there.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
