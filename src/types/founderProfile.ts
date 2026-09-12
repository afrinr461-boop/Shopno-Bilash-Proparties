import type { AuditFields, ID } from "./common";

export interface FounderGalleryImage {
  src: string;
  caption?: string;
}

/**
 * Owner/Founder profile — a singleton (one person featured, fixed id
 * `"founder"`), same shape as `CompanySettings`. Backs the premium public
 * `/founder` experience (hero, story, statement, vision/philosophy,
 * principles, gallery) — every field here is optional except the three
 * basics (`name`/`title`/`bio`), so a section with nothing entered simply
 * doesn't render rather than showing invented copy.
 */
export interface FounderProfile extends AuditFields {
  id: ID;
  name: string;
  title: string;
  /** Short hero tagline, e.g. "20 years building homes people trust." */
  intro?: string;
  /** The founder's story/journey — the page's main biography section. */
  bio: string;
  /** A personal message/quote, shown as the page's dedicated Statement section. */
  statement?: string;
  vision?: string;
  mission?: string;
  philosophy?: string;
  /** Leadership principles / core beliefs, one per line in the admin form. */
  principles: string[];
  /** Milestones/facts (e.g. "Founded the company in 2018"), shown as a bulleted list. */
  highlights: string[];
  photo?: string;
  /** Additional photos (at a project/site, with architecture, etc.), each with an optional caption. */
  gallery: FounderGalleryImage[];
}
