/**
 * Public gallery data. Same lean-public-shape philosophy as
 * content/projects.ts — linked to a project by `projectSlug` where relevant.
 */
import type { ImageAsset } from "./shared";

export const GALLERY_CATEGORIES = [
  "Projects",
  "Architecture",
  "Construction",
  "Interiors",
  "Company",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface GalleryItem {
  id: string;
  title?: string;
  category: GalleryCategory;
  image: ImageAsset;
  caption?: string;
  projectSlug?: string;
  date?: string;
}

/**
 * ⚠ DEMO DATA — populated at the user's request so the site is browsable
 * for visual QA. Not real photography (placeholder images) and not a real
 * archive of dated events. Empty this array again (or replace with real
 * photography) before launch — see the matching note in content/projects.ts.
 */
const img = (title: string): ImageAsset => ({ src: "/placeholder-image.png", alt: title });

export const galleryItems: GalleryItem[] = [
  { id: "g1", title: "Meridian Residences — Facade Study", category: "Architecture", image: img("Facade study for Meridian Residences"), caption: "Early facade concept for the Gulshan tower.", projectSlug: "meridian-residences" },
  { id: "g2", title: "Structural Frame", category: "Construction", image: img("Structural frame under construction"), caption: "The structural frame rising floor by floor.", projectSlug: "meridian-residences", date: "Aug 2026" },
  { id: "g3", title: "Harbor View — Street Elevation", category: "Projects", image: img("Harbor View Commercial street elevation"), projectSlug: "harbor-view-commercial" },
  { id: "g4", title: "The Grove — Courtyard", category: "Architecture", image: img("The Grove shared courtyard"), projectSlug: "the-grove" },
  { id: "g5", title: "Site Survey", category: "Construction", image: img("Site survey and groundbreaking"), projectSlug: "meridian-residences" },
  { id: "g6", title: "Living Space Concept", category: "Interiors", image: img("Interior concept rendering") },
  { id: "g7", title: "Our Team on Site", category: "Company", image: img("Team visiting a construction site") },
  { id: "g8", title: "Materials & Finishes", category: "Interiors", image: img("Material and finish selection") },
  { id: "g9", title: "Riverside Plots — Aerial", category: "Projects", image: img("Riverside Plots aerial view"), projectSlug: "riverside-plots" },
  { id: "g10", title: "Foundation Work", category: "Construction", image: img("Foundation work in progress"), projectSlug: "meridian-residences", date: "Jun 2025" },
];
