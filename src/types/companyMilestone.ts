import type { AuditFields, ID } from "./common";

/** A preset, theme-matched symbol per milestone — kept as a small closed set (not a free-text icon name) so the admin form is a dropdown, not a typo-prone text field, and every value is guaranteed to resolve to a real icon. */
export const MILESTONE_ICONS = ["founded", "handover", "partnership", "growth", "award", "expansion", "milestone"] as const;
export type MilestoneIconKey = (typeof MILESTONE_ICONS)[number];

export interface CompanyMilestone extends AuditFields {
  id: ID;
  year: string;
  title: string;
  /** Shown directly in the timeline. */
  summary: string;
  /** Shown behind "Read More" — optional, since a short entry may not need one. */
  details?: string;
  icon: MilestoneIconKey;
}
