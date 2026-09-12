import "server-only";
import { projectContentRepository } from "@/features/projectContent/repository";
import { unitContentRepository } from "@/features/unitContent/repository";
import { newsRepository } from "@/features/news/repository";
import { getPropertyListingsAsync } from "@/lib/propertiesAsync";
import type { PropertyListing } from "@/lib/properties";
import type { Project } from "@/content/projects";
import type { Unit } from "@/content/units";
import type { NewsArticle } from "@/content/news";

export interface SiteNavData {
  projects: Project[];
  units: Unit[];
  listings: PropertyListing[];
  newsArticles: NewsArticle[];
}

/**
 * The one live-data fetch behind `SitePageLoader`'s destination
 * titles and `SearchOverlay`'s results — both are Client Components
 * mounted directly in `(public)/layout.tsx`, so that layout fetches this
 * once (per request) and passes it down as props, the same
 * fetch-in-a-Server-Component-then-pass-as-prop pattern `/properties`
 * already uses for `getPropertyListingsAsync`. Closes the "admin edits
 * don't show up in search/tab titles" gap documented in
 * `projectContent/repository.ts` and `unitContent/repository.ts`.
 */
export async function getSiteNavDataAsync(): Promise<SiteNavData> {
  const [projects, units, listings, newsArticles] = await Promise.all([
    projectContentRepository.list(),
    unitContentRepository.list(),
    getPropertyListingsAsync(),
    newsRepository.list(),
  ]);
  return { projects, units, listings, newsArticles };
}
