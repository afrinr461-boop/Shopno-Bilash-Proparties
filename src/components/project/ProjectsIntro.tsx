import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Editorial split intro — large layered headline on the left, a skyline
 * visual breaking out to the viewport edge on the right (not contained by
 * the grid the way About's motif is). Deliberately a different composition
 * from the Hero/About-Intro dark full-bleed panel, so the site doesn't
 * open every page with the same treatment.
 */
export function ProjectsIntro() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block"
      >
        {/* Anchored to the bottom with a capped height, not the full (very
            tall/narrow) panel — matching <ProjectsBridge>'s proportions so
            "cover" crops to a recognizable skyline instead of zooming into
            one building's window grid. */}
        <ArchitecturalMotif fit="cover" className="text-border-strong absolute inset-x-0 bottom-0 h-[82%] w-full opacity-70" />
        <div className="from-bg absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
      </div>

      <Container className="relative">
        <div className="max-w-2xl py-28 sm:py-36 lg:max-w-xl lg:py-44">
          <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
            Our Projects
          </Reveal>
          <h1 className="flex flex-col">
            <Reveal as="span" className="text-display-xl">
              Every development
            </Reveal>
            <Reveal as="span" delay={100} className="text-display-xl text-fg-subtle">
              starts with land.
            </Reveal>
          </h1>
          <Reveal delay={220}>
            <p className="text-body-lg text-fg-muted mt-8 max-w-md">
              Explore what we&rsquo;re planning, building and delivering —
              organized by place, type and progress, not just listed.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
