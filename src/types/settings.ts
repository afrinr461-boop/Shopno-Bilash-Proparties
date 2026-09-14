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
  /**
   * A custom uploaded logo, replacing the bundled `/logo.webp` everywhere
   * the site shows a logo (public header/footer, login page, Admin
   * sidebar, Owner Portal). Independent of `logoMode` — uploading an
   * image doesn't switch to it automatically, the admin picks explicitly.
   */
  logo?: string;
  /** Whether the logo mark actually shown is the uploaded/default image, or just the company name as text — for a company that doesn't have a finished logo image yet. Defaults to "image" (the original bundled logo) when unset, so nothing changes until this is touched. */
  logoMode?: "image" | "name";
  address?: string;
  phone?: string;
  /** Digits only (with country code, e.g. "8801XXXXXXXXX") — the footer builds a `https://wa.me/<digits>` link from this directly, so anything typed here has non-digit characters stripped before use. Separate from `phone` since a business's call number and WhatsApp number are often different in Bangladesh. */
  whatsapp?: string;
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
  socialX?: string;
  socialThreads?: string;
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
