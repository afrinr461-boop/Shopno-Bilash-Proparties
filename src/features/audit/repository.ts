import "server-only";
import { randomUUID } from "node:crypto";
import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { AuditLog } from "@/types/audit-log";
import type { ID } from "@/types/common";

/**
 * Append-only by construction, not just by convention: this module never
 * exports an `update`/`remove` call, only `record`. Backed by the real
 * database (`prisma/schema.prisma`'s `AuditLog` model) — see
 * `src/lib/prismaRepository.ts` for why every domain shares one adapter.
 */
export const auditLogRepository: Repository<AuditLog> = createPrismaRepository<AuditLog>("auditLog");

export async function recordAuditEvent(entry: {
  actorUserId: ID;
  action: string;
  entityType: string;
  entityId: ID;
  ipAddress?: string;
  projectId?: ID;
  previousValue?: unknown;
  newValue?: unknown;
}): Promise<AuditLog> {
  return auditLogRepository.create({
    id: randomUUID(),
    occurredAt: new Date().toISOString(),
    ...entry,
  });
}
