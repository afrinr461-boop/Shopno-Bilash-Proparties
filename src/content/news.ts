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

/** Not populated yet — real articles are created by admin via the Website CMS (`/admin/content/news`), not static data here. */
export const newsArticles: NewsArticle[] = [];
