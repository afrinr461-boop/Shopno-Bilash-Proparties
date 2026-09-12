import "server-only";
import { unitContentRepository } from "@/features/unitContent/repository";
import { projectContentRepository } from "@/features/projectContent/repository";
import type { PropertyListing } from "@/lib/properties";

/**
 * Website CMS — the admin-editable equivalent of `getPropertyListings()`
 * (`lib/properties.ts`), joining `unitContentRepository` to
 * `projectContentRepository` instead of the static files. Used by the
 * public `/properties` page; not (yet) by `SavedPageContent`/
 * `searchIndex.ts` — see `lib/properties.ts`'s and
 * `features/unitContent/repository.ts`'s doc comments for why.
 *
 * Kept in its own file, separate from `lib/properties.ts`, specifically so
 * that file (imported by the client component `SavedPageContent.tsx`)
 * never pulls in `db.ts`'s `import "server-only"` transitively.
 */
export async function getPropertyListingsAsync(): Promise<PropertyListing[]> {
  const [allUnits, allProjects] = await Promise.all([unitContentRepository.list(), projectContentRepository.list()]);
  return allUnits.reduce<PropertyListing[]>((acc, unit) => {
    const project = allProjects.find((p) => p.slug === unit.projectSlug);
    if (project) acc.push({ ...unit, project });
    return acc;
  }, []);
}
