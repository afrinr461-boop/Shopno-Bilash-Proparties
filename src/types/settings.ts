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
  /** Free text since hours don't fit one fixed format (e.g. "Sat–Thu, 10am–7pm (GMT+6)") — shown in the footer's Contact column next to phone/email/address, hidden entirely while unset. */
  hours?: string;
  /**
   * Social profile URLs — each optional and independent, same "never
   * invent, never show a dead/placeholder link" rule as `socialLinks` in
   * `content/footer.ts` used to enforce by staying empty: the footer's
   * Follow column only ever renders an icon for a platform that actually
   * has a URL set here.
   */
  socialInstagram?: string;
  socialFacebook?: string;
  socialTiktok?: string;
  socialPinterest?: string;
  socialYoutube?: string;
  socialLinkedin?: string;
  /** Prompt 9 §14 — configurable rather than hardcoded, consumed by `formatDate`-adjacent display logic where wired. */
  dateFormat?: string;
  timeZone?: string;
  /** Fallback used by the alert engine's low-stock check when a material has no per-material `MaterialThreshold` row of its own. */
  defaultLowStockThreshold?: number;
  /** How many days before a due date (installment, document expiry, booking expiry, task/milestone) the alert engine starts surfacing it. */
  reminderLeadDays?: number;
  /** The public About page's "Our Impact" stat row — four fixed slots (not an open-ended list, so no separate CRUD table). Each is `undefined` until the admin sets a real figure; the public page shows an honest "—" placeholder rather than a fabricated number. */
  impactOngoingDevelopments?: number;
  impactDevelopmentAreaAcres?: number;
  impactLocations?: number;
  impactLandownerPartnerships?: number;
}
