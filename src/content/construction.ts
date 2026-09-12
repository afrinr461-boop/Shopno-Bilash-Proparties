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

/**
 * ⚠ DEMO DATA — populated at the user's request so the site is browsable
 * for visual QA (2026-09-06). Not a real construction record. See the
 * matching note in content/projects.ts. Empty this array again (or replace
 * with real progress data) before launch.
 */
const img = (alt: string) => ({ src: "/placeholder-image.png", alt });

export const constructionProgress: ConstructionProgress[] = [
  {
    projectSlug: "meridian-residences",
    overallProgress: 62,
    currentPhase: "Structural Development",
    lastUpdated: "August 2026",
    introduction:
      "A running record of Meridian Residences under construction — updated as each phase progresses.",
    milestones: [
      { title: "Site Preparation", status: "completed", date: "Mar 2025", description: "Clearing, survey and site mobilization." },
      { title: "Foundation", status: "completed", date: "Jun 2025", description: "Piling and foundation work completed across the footprint." },
      { title: "Structural Work", status: "in-progress", date: "From Sep 2025", description: "Column and slab casting progressing floor by floor.", progress: 62 },
      { title: "Brickwork & Envelope", status: "upcoming", description: "External walls and building envelope." },
      { title: "Electrical & Plumbing", status: "upcoming", description: "Rough-in for all building systems." },
      { title: "Interior Finishing", status: "upcoming", description: "Flooring, fittings and unit handover preparation." },
      { title: "Handover", status: "upcoming", description: "Final inspection and resident handover." },
    ],
    updates: [
      {
        date: "Mar 2025",
        phase: "Site Preparation",
        title: "Groundbreaking",
        description: "Site clearance and survey work completed, marking the official start of construction.",
        images: [img("Site preparation at Meridian Residences")],
        progress: 5,
      },
      {
        date: "Jun 2025",
        phase: "Foundation",
        title: "Foundation Complete",
        description: "Piling and foundation work finished across the full building footprint, on schedule.",
        images: [img("Foundation work at Meridian Residences")],
        progress: 20,
      },
      {
        date: "Jan 2026",
        phase: "Structural Work",
        title: "Sixth Floor Slab Cast",
        description: "Column and slab casting has reached the sixth floor, progressing at roughly one floor per month.",
        images: [img("Structural work at Meridian Residences")],
        progress: 45,
      },
      {
        date: "Aug 2026",
        phase: "Structural Work",
        title: "Structure Nearing Completion",
        description: "The main structural frame is now visible up to the twelfth floor, with the remaining floors on track for this quarter.",
        images: [img("Structural progress at Meridian Residences")],
        progress: 62,
      },
    ],
    beforeAfter: [
      {
        label: "Main Site — Mar 2025 vs. Aug 2026",
        before: img("Site before construction began"),
        current: img("Site with structural work underway"),
      },
    ],
  },
];
