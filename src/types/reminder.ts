import type { AuditFields, ID } from "./common";

export type ReminderPriority = "low" | "medium" | "high" | "critical";
export type ReminderStatus = "pending" | "completed" | "dismissed";
export type ReminderRepeatRule = "none" | "daily" | "weekly" | "monthly";

/**
 * Prompt 9 §5 — a plain admin-created reminder, distinct from the
 * computed `SystemAlert`s in `features/alerts/engine.ts` (those are
 * derived live from real data and never stored). A Reminder is something
 * an admin explicitly asked to be reminded about — it has to be a real
 * row since nothing else in the system would otherwise know about it.
 */
export interface Reminder extends AuditFields {
  id: ID;
  title: string;
  description?: string;
  date: string;
  time?: string;
  priority: ReminderPriority;
  projectId?: ID;
  /** Free-text label for what this reminder is about (e.g. "Installment — Unit 4C") — no fixed entity-type enum, matching the brief's open-ended "related entity" list (installment/booking/document/contractor/task/milestone/custom). */
  relatedEntity?: string;
  /** Optional deep link to the related record, when one exists. */
  relatedHref?: string;
  assignedUserId?: ID;
  repeatRule?: ReminderRepeatRule;
  status: ReminderStatus;
  completedDate?: string;
}
