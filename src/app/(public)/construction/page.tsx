import type { Metadata } from "next";
import { ConstructionOverviewClosingCTA } from "@/components/construction/ConstructionOverviewClosingCTA";
import { ConstructionOverviewGrid } from "@/components/construction/ConstructionOverviewGrid";
import { ConstructionOverviewIntro } from "@/components/construction/ConstructionOverviewIntro";
import { constructionProgress } from "@/content/construction";
import { projectContentRepository } from "@/features/projectContent/repository";
import type { Project } from "@/content/projects";

export const metadata: Metadata = {
  title: "Construction",
  description:
    "Follow real construction progress across every Shopno Bilash Properties development currently underway.",
  alternates: { canonical: "/construction" },
};

/**
 * The site-wide construction index the header's "More" menu has always
 * pointed at (`config/navigation.ts`) — previously a dead link, since only
 * the per-project `/projects/[slug]/construction` page existed. This joins
 * `content/construction.ts` to `content/projects.ts` so it never shows a
 * project construction updates weren't actually published for.
 */
export default async function ConstructionOverviewPage() {
  const projects = await projectContentRepository.list();
  const items = constructionProgress
    .map((progress) => {
      const project = projects.find((p) => p.slug === progress.projectSlug);
      return project ? { project, progress } : null;
    })
    .filter((item): item is { project: Project; progress: (typeof constructionProgress)[number] } => item !== null);

  return (
    <>
      <ConstructionOverviewIntro />
      <ConstructionOverviewGrid items={items} />
      <ConstructionOverviewClosingCTA />
    </>
  );
}
