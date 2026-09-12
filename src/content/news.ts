/**
 * Public news/updates data. Same lean-public-shape philosophy as
 * content/projects.ts — linked to a project by `projectSlug` where relevant.
 */
import type { ImageAsset } from "./shared";

export const NEWS_CATEGORIES = ["Projects", "Construction", "Company", "Events", "Insights"] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: NewsCategory;
  date: string;
  excerpt: string;
  coverImage: ImageAsset;
  /** Paragraphs — kept as a plain string array rather than rich markup, deliberately simple until a real CMS exists. */
  content: string[];
  images?: ImageAsset[];
  projectSlug?: string;
  featured: boolean;
}

/**
 * ⚠ DEMO DATA — populated at the user's request so the site is browsable
 * for visual QA. Not real announcements — every date and figure here
 * mirrors the same demo projects/construction data used elsewhere on the
 * site (never invented separately). Empty this array again (or replace
 * with real articles) before launch — see the matching note in
 * content/projects.ts.
 */
const img = (alt: string): ImageAsset => ({ src: "/placeholder-image.png", alt });

export const newsArticles: NewsArticle[] = [
  {
    id: "n1",
    slug: "meridian-residences-structural-milestone",
    title: "Meridian Residences reaches its structural milestone",
    category: "Construction",
    date: "August 2026",
    excerpt:
      "The main structural frame at Meridian Residences is now visible up to the twelfth floor, with the remaining floors on track for this quarter.",
    coverImage: img("Structural progress at Meridian Residences"),
    content: [
      "Construction at Meridian Residences has reached an important structural milestone, with column and slab casting now visible up to the twelfth floor of the fourteen-storey tower.",
      "The project's structural work has progressed at roughly one floor per month since it began, following the completion of foundation work in mid-2025. The team expects the remaining floors to close out this quarter, ahead of the transition into brickwork and building envelope work.",
      "Meridian Residences remains on track for its targeted 2027 completion, with 48 apartments planned across the development.",
    ],
    images: [img("Structural work at Meridian Residences")],
    projectSlug: "meridian-residences",
    featured: true,
  },
  {
    id: "n2",
    slug: "harbor-view-commercial-nears-completion",
    title: "Harbor View Commercial enters its final finishing stage",
    category: "Projects",
    date: "July 2026",
    excerpt:
      "Our Agrabad commercial development is now in its final finishing stages, ahead of handover to its retail and office tenants.",
    coverImage: img("Harbor View Commercial nearing completion"),
    content: [
      "Harbor View Commercial, our mixed-use development in Chattogram's Agrabad business district, has entered its final finishing stage.",
      "The building pairs ground-floor retail with office floors above, designed for the businesses that anchor Agrabad's daily activity. Interior fit-out and building systems work are now underway ahead of handover.",
    ],
    projectSlug: "harbor-view-commercial",
    featured: false,
  },
  {
    id: "n3",
    slug: "how-we-evaluate-landowner-partnerships",
    title: "How we evaluate a landowner partnership",
    category: "Insights",
    date: "May 2026",
    excerpt:
      "A look at how our team assesses land and property for potential joint-venture development — from first evaluation to signed agreement.",
    coverImage: img("Site evaluation for a landowner partnership"),
    content: [
      "Every joint-venture development we take on starts the same way: with a careful look at the land itself — its location, size, zoning and development potential.",
      "From there, our team works out project feasibility, puts together a concrete development proposal, and — if it makes sense for everyone involved — formalizes the partnership in a project-specific agreement backed by legal documentation.",
      "It's a deliberately unhurried process. A joint venture is a long-term relationship, not a single transaction, so getting the evaluation right matters more than moving quickly.",
    ],
    featured: false,
  },
  {
    id: "n4",
    slug: "the-grove-handover-complete",
    title: "The Grove: handover complete",
    category: "Projects",
    date: "2023",
    excerpt: "All 36 apartments at The Grove, Uttara, have been handed over to their residents.",
    coverImage: img("The Grove residential development"),
    content: [
      "The Grove, our residential development in Sector 11, Uttara, has been fully handed over — 36 apartments across two connected blocks, built around a shared central courtyard.",
    ],
    projectSlug: "the-grove",
    featured: false,
  },
  {
    id: "n5",
    slug: "our-approach-to-construction-transparency",
    title: "Our approach to construction transparency",
    category: "Company",
    date: "Mar 2026",
    excerpt:
      "Why we publish real construction progress — timelines, photographs and milestones — rather than a single completion date.",
    coverImage: img("Construction progress documentation"),
    content: [
      "For every project where we can, we publish real construction progress rather than a single promised handover date.",
      "That means dated photographs, milestone-by-milestone status, and honest updates on what's ahead — the same information our landowner and investor partners see, made public on each project's page.",
    ],
    featured: false,
  },
];
