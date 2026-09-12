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

/**
 * ⚠ DEMO DATA — populated at the user's request so the site is browsable
 * for visual QA during development (2026-09-06). None of this is real
 * business information: names, numbers and copy below are placeholders.
 * Replace with real project data (or empty this array again) before the
 * site goes live. The image files are solid-color local placeholders
 * (public/placeholder-image.png, public/placeholder-floorplan.png), not
 * real photography.
 */
const placeholderImage: ProjectImage = {
  src: "/placeholder-image.png",
  alt: "Placeholder architectural image",
};

export const projects: Project[] = [
  {
    id: "1",
    name: "Meridian Residences",
    slug: "meridian-residences",
    location: "Gulshan 2, Dhaka",
    city: "Dhaka",
    projectType: "Residential",
    status: "ongoing",
    shortDescription:
      "A 14-storey residential tower in the heart of Gulshan, designed around light, air and long-term livability.",
    description:
      "Meridian Residences brings 48 apartments to one of Dhaka's most established neighborhoods, planned around generous room proportions, cross-ventilation and shared green space rather than maximum unit count. Construction is underway with handover targeted for 2027.",
    concept:
      "A quiet, light-filled counterpoint to the density around it — architecture that gives residents room to breathe.",
    coverImage: placeholderImage,
    gallery: [placeholderImage, placeholderImage, placeholderImage, placeholderImage, placeholderImage, placeholderImage],
    completionYear: 2027,
    totalUnits: 48,
    availableUnits: 12,
    unitTypes: ["2 Bed", "3 Bed", "Duplex"],
    area: "1.2 acres",
    floors: 14,
    buildingType: "High-rise",
    features: ["Rooftop Garden", "Underground Parking", "Backup Generator", "24/7 Security", "Community Hall", "Gymnasium"],
    locationDescription:
      "Set on a quiet residential road in Gulshan 2, close to the neighborhood's established schools, clinics and embassies.",
    featured: true,
  },
  {
    id: "2",
    name: "Harbor View Commercial",
    slug: "harbor-view-commercial",
    location: "Agrabad, Chattogram",
    city: "Chattogram",
    projectType: "Commercial",
    status: "near-completion",
    shortDescription: "A mixed commercial development serving Chattogram's Agrabad business district.",
    description:
      "Harbor View Commercial pairs ground-floor retail with office floors above, built for the businesses that anchor Agrabad's daily activity. The building is now in its final finishing stages ahead of handover.",
    coverImage: placeholderImage,
    gallery: [placeholderImage, placeholderImage, placeholderImage],
    completionYear: 2026,
    area: "0.6 acres",
    floors: 8,
    buildingType: "Commercial",
    featured: false,
  },
  {
    id: "3",
    name: "The Grove",
    slug: "the-grove",
    location: "Sector 11, Uttara, Dhaka",
    city: "Dhaka",
    projectType: "Residential",
    status: "completed",
    shortDescription: "A completed residential development of 36 family apartments in Uttara.",
    description:
      "The Grove was handed over to its residents in 2023 — 36 apartments across two connected blocks, built around a shared central courtyard.",
    coverImage: placeholderImage,
    gallery: [placeholderImage, placeholderImage],
    completionYear: 2023,
    totalUnits: 36,
    availableUnits: 0,
    area: "0.9 acres",
    floors: 7,
    buildingType: "Low-rise",
    featured: false,
  },
  {
    id: "4",
    name: "Emerald Court",
    slug: "emerald-court",
    location: "Zindabazar, Sylhet",
    city: "Sylhet",
    projectType: "Residential",
    status: "upcoming",
    shortDescription: "A planned residential development in Sylhet, entering the design phase.",
    description:
      "Emerald Court is in early planning — architectural and financial strategy are being finalized ahead of a public launch.",
    coverImage: placeholderImage,
    gallery: [placeholderImage],
    buildingType: "Mid-rise",
    featured: false,
  },
  {
    id: "5",
    name: "Riverside Plots",
    slug: "riverside-plots",
    location: "Sonadanga, Khulna",
    city: "Khulna",
    projectType: "Land Development",
    status: "planning",
    shortDescription: "A serviced land development project along Khulna's riverside corridor.",
    description:
      "Riverside Plots subdivides and services a riverside parcel into individually-titled residential plots, currently in the planning and approvals stage.",
    coverImage: placeholderImage,
    gallery: [placeholderImage],
    area: "3.5 acres",
    featured: false,
  },
];
