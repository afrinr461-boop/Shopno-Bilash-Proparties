import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { NewsArticle } from "@/content/news";

/**
 * CMS Step 1 — the first content domain wired end-to-end: admin can
 * create/edit/delete a News article and the public `/news` pages read
 * from this same repository, not the static `content/news.ts` array
 * directly. Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`. Seeded once, from that file's existing
 * (demo) articles, by `prisma/seed.ts` — not from this module, so the
 * seed only ever runs once against the real database rather than resetting
 * in-memory data on every server restart.
 *
 * ⚠ Known, documented gap (not silently glossed over): the global search
 * index (`lib/searchIndex.ts`) and the sitemap (`app/sitemap.ts`,
 * `app/(public)/sitemap/page.tsx`) still read `content/news.ts` directly,
 * so a brand-new article won't appear in search/sitemap until those are
 * migrated too — left out of this slice because `searchIndex.ts` is a
 * synchronous, cached, hot-path module (every keystroke in the search
 * overlay) and converting it to async safely deserves its own careful
 * pass, not a rushed change alongside this one.
 */
export const newsRepository: Repository<NewsArticle> = createPrismaRepository<NewsArticle>("newsArticle");

export async function findNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const articles = await newsRepository.list();
  return articles.find((a) => a.slug === slug) ?? null;
}

/** Case- and accent-insensitive-enough slugify for a title typed into the admin form. */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
