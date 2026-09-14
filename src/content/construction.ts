/**
 * Public construction-progress data — one entry per project that actually
 * has development updates to show. Same lean-public-shape philosophy as
 * content/projects.ts and content/units.ts, linked by `projectSlug`.
 */
import type { ImageAsset } from "./shared";

export type MilestoneStatus = "completed" | "in-progress" | "upcoming";

export interface ConstructionMilestone {
  title: string;
  status: MilestoneStatus;
  /** Only set when a real date is known — never estimated. */
  date?: string;
  description?: string;
  /** 0–100, only when a real per-milestone figure exists. */
  progress?: number;
}

export interface ConstructionUpdate {
  date: string;
  phase: string;
  title: string;
  description: string;
  images: ImageAsset[];
  /** Overall progress at the time of this update, if recorded. */
  progress?: number;
}

export interface BeforeAfterPair {
  label: string;
  before: ImageAsset;
  current: ImageAsset;
}

export interface ConstructionProgress {
  projectSlug: string;
  /** 0–100 — omit entirely rather than guess; the UI hides the figure gracefully. */
  overallProgress?: number;
  currentPhase?: string;
  lastUpdated?: string;
  introduction?: string;
  milestones: ConstructionMilestone[];
  updates: ConstructionUpdate[];
  /** Only populate when a genuine before/current pair exists for the same vantage point — never fabricated. */
  beforeAfter?: BeforeAfterPair[];
}

/** Not populated yet — no project currently has real construction progress recorded. */
export const constructionProgress: ConstructionProgress[] = [];
