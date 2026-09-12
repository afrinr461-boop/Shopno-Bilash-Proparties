import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SingleElevation } from "@/components/ui/SingleElevation";
import { StatCounter } from "@/components/home/StatCounter";

export interface PropertiesHeroProps {
  availableCount: number;
  developmentCount: number;
  typeCount: number;
}

/**
 * Light editorial opener — deliberately not another full-viewport dark
 * cinematic hero (the site already has four of those); this page opens more
 * like <ProjectsIntro> in tone. Its visual anchor is two things now: the
 * real, computed stat row (unchanged) plus a single building elevation
 * breaking to the edge — "one home," matching the headline, not a skyline.
 */
export function PropertiesHero({ availableCount, developmentCount, typeCount }: PropertiesHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <Reveal
        as="div"
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34%] items-center lg:flex"
      >
        <SingleElevation className="text-border-strong h-auto w-full opacity-70" />
        <div className="from-bg absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
      </Reveal>

      <Container className="relative">
        <div className="max-w-2xl py-28 sm:py-36 lg:py-40">
          <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
            Properties
          </Reveal>
          <h1 className="flex flex-col">
            <Reveal as="span" className="text-display-xl">
              One home,
            </Reveal>
            <Reveal as="span" delay={100} className="text-display-xl text-fg-subtle">
              considered on its own.
            </Reveal>
          </h1>
          <Reveal delay={220}>
            <p className="text-body-lg text-fg-muted mt-8 max-w-md">
              Every individually available unit across our developments — apartments, commercial
              space and serviced plots — browsable on its own terms, not just as part of a project.
            </p>
          </Reveal>
        </div>

        <Reveal delay={280} className="border-border grid grid-cols-3 gap-6 border-t py-10 sm:gap-10">
          <StatCounter label="Available Now" value={availableCount} />
          <StatCounter label="Developments" value={developmentCount} />
          <StatCounter label="Property Types" value={typeCount} />
        </Reveal>
      </Container>
    </section>
  );
}
