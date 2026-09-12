import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { PageContent, PageContentId } from "@/content/legal";

/**
 * CMS Step — Pages, scoped to the four legal pages (Privacy, Terms,
 * Disclaimer, Cookies): the one place `content/legal.ts` already models a
 * single structured shape (`LegalPage`) shared by multiple pages. About
 * and Services are NOT covered here — those pages compose many
 * independent section components that each import their own data
 * directly (see `content/about.ts`/`content/services.ts`), which would
 * need every section component rewritten to accept props first; a much
 * larger effort than this pass.
 *
 * The four ids are fixed (see `PageContentId`) and always seeded — there
 * is deliberately no `create`/`delete` action for this domain, only
 * `update`, matching that you edit a legal page's wording, you don't add
 * or remove which legal pages exist.
 */
export const pageContentRepository: Repository<PageContent> = createPrismaRepository<PageContent>("pageContent");

export async function findPageContent(id: PageContentId): Promise<PageContent | null> {
  return pageContentRepository.findById(id);
}
