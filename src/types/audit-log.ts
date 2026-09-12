import type { ID } from "./common";

/**
 * Append-only. Nothing in the application should expose an update/delete
 * path for this record — see ARCHITECTURE.md §14 Audit Log Architecture.
 */
export interface AuditLog {
  id: ID;
  actorUserId: ID;
  action: string; // e.g. "unit.status.update"
  entityType: string; // e.g. "Unit"
  entityId: ID;
  previousValue?: unknown;
  newValue?: unknown;
  occurredAt: string;
  ipAddress?: string;
  /** Prompt 9 — project context for the "must never bleed across projects" rule. Absent on entries recorded before this step, and on genuinely global actions (user/role/settings changes) — a missing value means "global," not "unknown." */
  projectId?: ID;
}
