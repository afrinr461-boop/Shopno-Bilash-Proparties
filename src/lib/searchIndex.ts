/**
 * Global search index, built from the live CMS content
 * (`SiteNavData` — projects/units/news, fetched once by
 * `(public)/layout.tsx` via `getSiteNavDataAsync` and passed down through
 * `SearchOverlay` as a prop) plus `content/services.ts` and a static list
 * of real routes, neither of which are CMS-backed. No network call from
 * here — the data already arrived as a prop — and nothing invented: a
 * route only appears here if it actually resolves.
 */
import { PROJECT_STATUS_LABEL, type Project } from "@/content/projects";
import { UNIT_STATUS_LABEL } from "@/content/units";
import { services } from "@/content/services";
import type { PropertyListing } from "@/lib/properties";
import type { NewsArticle } from "@/content/news";

export type SearchItemType = "project" | "property" | "service" | "page" | "news";

export interface SearchItem {
  type: SearchItemType;
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  href: string;
  image?: { src: string; alt: string };
  /** Lowercased search-only terms — never rendered. */
  keywords: string[];
}

export const CATEGORY_LABEL: Record<SearchItemType, string> = {
  project: "Projects",
  property: "Properties",
  service: "Services",
  page: "Pages",
  news: "News",
};

/** Extra real-world terminology mapped to services that actually exist (brief §18) — never to a service that doesn't. */
const SERVICE_EXTRA_KEYWORDS: Record<string, string[]> = {
  "property-development": ["apartment", "house", "residential", "development"],
  "construction-delivery": ["construction", "build", "building", "site", "project management"],
  "property-sales": ["buy", "flat", "apartment", "house", "villa", "unit", "acquisition"],
  "landowner-partnerships": ["jv", "joint venture", "land", "landowner"],
  "investment-opportunities": ["investment", "invest", "capital", "partner", "opportunity"],
  "project-management": ["management", "project"],
};

/** Only routes that actually resolve — checked against src/app/(public) directly. */
const PAGES: { title: string; subtitle: string; href: string; keywords: string[] }[] = [
  { title: "Home", subtitle: "Back to the start.", href: "/", keywords: ["home"] },
  {
    title: "About",
    subtitle: "Who we are and how we work.",
    href: "/about",
    keywords: ["about", "company", "story", "values"],
  },
  {
    title: "Projects",
    subtitle: "Every development we're currently building.",
    href: "/projects",
    keywords: ["projects", "developments"],
  },
  {
    title: "Properties",
    subtitle: "Available units, ready to reserve or buy.",
    href: "/properties",
    keywords: ["properties", "units", "apartments", "flats"],
  },
  {
    title: "Services",
    subtitle: "Every way to work with us.",
    href: "/services",
    keywords: ["services"],
  },
  {
    title: "Founder",
    subtitle: "Meet the owner and founder behind Shopno Bilash Properties.",
    href: "/founder",
    keywords: ["founder", "owner", "leadership", "ceo", "managing director", "about the founder"],
  },
  {
    title: "Construction",
    subtitle: "Real progress across every active development.",
    href: "/construction",
    keywords: ["construction", "progress", "build", "site"],
  },
  {
    title: "Landowners & JV",
    subtitle: "Land partnerships and joint ventures.",
    href: "/landowners",
    keywords: ["landowners", "jv", "joint venture", "land"],
  },
  {
    title: "Investment",
    subtitle: "Investment and development opportunities.",
    href: "/landowners#investment",
    keywords: ["investment", "invest", "opportunity", "partner"],
  },
  {
    title: "Gallery",
    subtitle: "A visual record of what we build.",
    href: "/gallery",
    keywords: ["gallery", "photos", "images", "architecture"],
  },
  {
    title: "News",
    subtitle: "Project updates and company news.",
    href: "/news",
    keywords: ["news", "updates", "journal"],
  },
  {
    title: "Enquire",
    subtitle: "Start a conversation with our team.",
    href: "/contact",
    keywords: ["enquire", "contact", "reach", "email"],
  },
  {
    title: "Saved Properties",
    subtitle: "Properties you've saved for later.",
    href: "/saved",
    keywords: ["saved", "wishlist", "favorites", "shortlist"],
  },
  {
    title: "Privacy Policy",
    subtitle: "How this website handles information.",
    href: "/privacy",
    keywords: ["privacy", "policy", "data"],
  },
  {
    title: "Terms & Conditions",
    subtitle: "Terms governing use of this website.",
    href: "/terms",
    keywords: ["terms", "conditions", "legal"],
  },
  {
    title: "Property Disclaimer",
    subtitle: "How to read property and project information.",
    href: "/disclaimer",
    keywords: ["disclaimer", "legal"],
  },
  {
    title: "Cookie Policy",
    subtitle: "What this website stores in your browser.",
    href: "/cookies",
    keywords: ["cookie", "cookies", "policy"],
  },
  {
    title: "Sitemap",
    subtitle: "Every page on this website, organized.",
    href: "/sitemap",
    keywords: ["sitemap", "site map"],
  },
];

export interface SearchIndexData {
  projects: Project[];
  listings: PropertyListing[];
  newsArticles: NewsArticle[];
}

function buildProjectItems(projects: Project[]): SearchItem[] {
  return projects.map((p) => ({
    type: "project",
    id: p.slug,
    title: p.name,
    subtitle: `${p.location} · ${p.projectType}`,
    meta: PROJECT_STATUS_LABEL[p.status],
    href: `/projects/${p.slug}`,
    image: p.coverImage,
    keywords: [p.name, p.location, p.city, p.projectType, p.shortDescription, PROJECT_STATUS_LABEL[p.status]]
      .filter((v): v is string => Boolean(v))
      .map((v) => v.toLowerCase()),
  }));
}

function buildPropertyItems(listings: PropertyListing[]): SearchItem[] {
  return listings.map((l) => ({
    type: "property",
    id: l.id,
    title: l.name,
    subtitle: `${l.project.name} · ${l.unitType}`,
    meta: [UNIT_STATUS_LABEL[l.status], l.area].filter(Boolean).join(" · "),
    href: `/projects/${l.projectSlug}/units/${l.slug}`,
    image: l.coverImage,
    keywords: [
      l.name,
      l.unitType,
      l.project.name,
      l.project.city,
      l.project.location,
      UNIT_STATUS_LABEL[l.status],
      l.area,
      l.facing,
      l.bedrooms ? `${l.bedrooms} bedroom` : undefined,
    ]
      .filter((v): v is string => Boolean(v))
      .map((v) => v.toLowerCase()),
  }));
}

function buildServiceItems(): SearchItem[] {
  return services.map((s) => ({
    type: "service",
    id: s.id,
    title: s.title,
    subtitle: s.description,
    // No anchor IDs exist on the Services page yet, so route straight to
    // each service's own real, already-verified CTA destination rather
    // than inventing a `/services#id` fragment that wouldn't scroll anywhere.
    href: s.ctaHref,
    keywords: [s.title, s.description, s.whoFor, ...(SERVICE_EXTRA_KEYWORDS[s.id] ?? [])].map((v) =>
      v.toLowerCase(),
    ),
  }));
}

function buildPageItems(): SearchItem[] {
  return PAGES.map((p) => ({ type: "page" as const, id: p.href, ...p }));
}

function buildNewsItems(newsArticles: NewsArticle[]): SearchItem[] {
  return newsArticles.map((a) => ({
    type: "news",
    id: a.id,
    title: a.title,
    subtitle: `${a.category} · ${a.date}`,
    href: `/news/${a.slug}`,
    image: a.coverImage,
    keywords: [a.title, a.category, a.excerpt, a.date].map((v) => v.toLowerCase()),
  }));
}

/**
 * Rebuilt from `data` — no module-level cache anymore, since `data` now
 * comes from the live database rather than a static import baked in at
 * module-load time. `SearchOverlay` still only calls this inside its own
 * `useMemo` keyed on `query` (and `data`, which is stable for the
 * lifetime of a page load), so this isn't recomputed on every keystroke.
 */
function getIndex(data: SearchIndexData): SearchItem[] {
  return [
    ...buildProjectItems(data.projects),
    ...buildPropertyItems(data.listings),
    ...buildServiceItems(),
    ...buildPageItems(),
    ...buildNewsItems(data.newsArticles),
  ];
}

/** Exact > starts-with > title-contains > keyword match > description match (brief §9) — never a real backend, just an honest ranked filter over real data. */
function scoreItem(item: SearchItem, q: string): number {
  const title = item.title.toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (item.keywords.some((k) => k === q)) return 50;
  if (item.keywords.some((k) => k.startsWith(q))) return 40;
  if (item.keywords.some((k) => k.includes(q))) return 25;
  if (item.subtitle?.toLowerCase().includes(q)) return 10;
  return 0;
}

export function searchIndex(query: string, data: SearchIndexData): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getIndex(data)
    .map((item) => ({ item, score: scoreItem(item, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

export const CATEGORY_ORDER: SearchItemType[] = ["project", "property", "service", "page", "news"];

export const RESULT_LIMITS: Record<SearchItemType, number> = {
  project: 3,
  property: 3,
  service: 3,
  page: 2,
  news: 2,
};

export interface GroupedResults {
  type: SearchItemType;
  items: SearchItem[];
  totalCount: number;
}

/** Groups + caps per category (brief §8) — the raw counts are kept so the UI can still say "12 more properties" truthfully. */
export function groupResults(results: SearchItem[]): GroupedResults[] {
  return CATEGORY_ORDER.map((type) => {
    const items = results.filter((r) => r.type === type);
    return { type, items: items.slice(0, RESULT_LIMITS[type]), totalCount: items.length };
  }).filter((g) => g.totalCount > 0);
}

/** Real, always-available discovery shortcuts for the pre-typing state (brief §12) — every href here is a route that exists. */
export const DISCOVERY_SHORTCUTS: { label: string; href: string }[] = [
  { label: "Projects", href: "/projects" },
  { label: "Properties", href: "/properties" },
  { label: "Services", href: "/services" },
  { label: "Founder", href: "/founder" },
  { label: "Construction", href: "/construction" },
  { label: "Landowners & JV", href: "/landowners" },
  { label: "Investment", href: "/landowners#investment" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
];
