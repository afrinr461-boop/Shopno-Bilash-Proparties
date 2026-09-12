import { BlueprintDiagram } from "@/components/ui/BlueprintDiagram";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { hero } from "@/content/contact";

/**
 * Light, editorial — statement on one side, an architectural visual on the
 * other, like Projects/Services — but a floor-plan sketch that draws itself
 * in on scroll, not the same skyline those pages use. A conversation about
 * a specific property or plot starts with a plan, not a city.
 */
export function ContactHero() {
  return (
    <section className="relative overflow-hidden">
      <Reveal
        as="div"
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] items-center lg:flex"
      >
        <BlueprintDiagram className="text-border-strong h-auto w-full opacity-70" />
        <div className="from-bg absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
      </Reveal>

      <Container className="relative">
        <div className="max-w-2xl py-24 sm:py-32 lg:max-w-xl lg:py-40">
          <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
            {hero.eyebrow}
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-display-xl max-w-3xl text-balance">{hero.headline}</h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-body-lg text-fg-muted mt-8 max-w-xl">{hero.supporting}</p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
