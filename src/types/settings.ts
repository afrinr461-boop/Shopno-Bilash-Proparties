import type { AuditFields, ID } from "./common";

/**
 * Company profile — a singleton, not a list (one company, one record,
 * fixed id `"company"`). Contact fields are optional and start unset,
 * same honesty already established by `content/contact.ts`'s
 * `contactInfo`: no real office address/phone/email exists yet, so none
 * is invented here either.
 */
export interface CompanySettings extends AuditFields {
  id: ID;
  legalName: string;
  displayName: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  /** Prompt 9 §14 — configurable rather than hardcoded, consumed by `formatDate`-adjacent display logic where wired. */
  dateFormat?: string;
  timeZone?: string;
  /** Fallback used by the alert engine's low-stock check when a material has no per-material `MaterialThreshold` row of its own. */
  defaultLowStockThreshold?: number;
  /** How many days before a due date (installment, document expiry, booking expiry, task/milestone) the alert engine starts surfacing it. */
  reminderLeadDays?: number;
}
