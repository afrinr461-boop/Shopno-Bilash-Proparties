/**
 * Public project data — a lean, display-oriented shape (not the heavy
 * internal `Project` type in src/types/project.ts, which carries admin-only
 * fields like budget/landownerId). This is what the future Admin Panel
 * would publish from the internal model onto the public site.
 */
import type { ImageAsset } from "./shared";

export type ProjectStatus =
  | "upcoming"
  | "planning"
  | "ongoing"
  | "near-completion"
  | "completed"
  | "sold-out";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  upcoming: "Upcoming",
  planning: "In Planning",
  ongoing: "Ongoing",
  "near-completion": "Near Completion",
  completed: "Completed",
  "sold-out": "Sold Out",
};

/** Dot color per status — deliberately just a tiny dot + label, never a colorful pill (brief §5). */
export const PROJECT_STATUS_TONE: Record<ProjectStatus, string> = {
  upcoming: "bg-fg-subtle",
  planning: "bg-fg-subtle",
  ongoing: "bg-accent",
  "near-completion": "bg-accent",
  completed: "bg-success",
  "sold-out": "bg-fg-muted",
};

export type ProjectImage = ImageAsset;

export interface NearbyPlace {
  label: string;
  /** Only set when a real, verified distance/time is known — never estimated. */
  distance?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  /** Specific display location, e.g. "Gulshan 2, Dhaka". */
  location: string;
  /** City only, e.g. "Dhaka" — the filterable/groupable geography field. */
  city: string;
  projectType: string;
  status: ProjectStatus;
  shortDescription: string;
  description: string;
  /** Architectural idea / design philosophy statement — the Design Story section's lead line. */
  concept?: string;
  coverImage: ProjectImage;
  gallery: ProjectImage[];
  completionYear?: number;
  totalUnits?: number;
  availableUnits?: number;
  /** e.g. ["2 Bed", "3 Bed", "Duplex"] — for the availability preview only, not a full unit explorer (Step 10). */
  unitTypes?: string[];
  area?: string;
  floors?: number;
  buildingType?: string;
  /** Short feature/amenity labels, e.g. "Rooftop Garden", "Underground Parking". */
  features?: string[];
  locationDescription?: string;
  nearbyPlaces?: NearbyPlace[];
  featured: boolean;
}

/** Not populated yet — real projects are created by admin via the Website CMS (`/admin/content/projects`), not static data here. */
export const projects: Project[] = [];
