import { Container } from "@/components/ui/Container";
import { NetworkMotif } from "@/components/ui/NetworkMotif";
import { Reveal } from "@/components/ui/Reveal";
import { hero, services } from "@/content/services";

/**
 * Same editorial-split family as <ProjectsIntro>/<ContactHero> — large
 * layered headline on one side, an architectural visual breaking to the
 * viewport edge on the other — but a connected-node diagram, not another
 * skyline, standing in for "six services, one company" rather than a
 * repeated set of buildings.
 */
export function ServicesHero() {
  return (
    <section className="relative overflow-hidden">
      <Reveal
        as="div"
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] items-center lg:flex"
      >
        <NetworkMotif className="text-border-strong h-auto w-full opacity-70" />
        <div className="from-bg absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
      </Reveal>

      <Container className="relative">
        <div className="max-w-2xl pt-28 pb-16 sm:pt-36 sm:pb-20 lg:max-w-xl lg:pt-44 lg:pb-24">
          <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
            {hero.eyebrow}
          </Reveal>
          <h1 className="flex flex-col">
            <Reveal as="span" className="text-display-xl">
              What we
            </Reveal>
            <Reveal as="span" delay={100} className="text-display-xl text-fg-subtle">
              actually do.
            </Reveal>
          </h1>
          <Reveal delay={220}>
            <p className="text-body-lg text-fg-muted mt-8 max-w-md">{hero.supporting}</p>
          </Reveal>
        </div>

        <Reveal delay={300} className="border-border flex items-center gap-4 border-t py-6">
          <span className="text-stat-lg text-success">{String(services.length).padStart(2, "0")}</span>
          <span className="text-body-sm text-fg-muted max-w-[16rem]">
            Ways to work with us — each one below, one at a time.
          </span>
        </Reveal>
      </Container>
    </section>
  );
}
