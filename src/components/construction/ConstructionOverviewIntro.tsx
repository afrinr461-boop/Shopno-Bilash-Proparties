import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Deliberately motif-free — every other index page (Projects, Properties,
 * Gallery, News) opens with its own architectural graphic, and stacking
 * one more onto this smaller aggregator page would start to feel
 * decorative rather than distinctive. Quiet typography carries it instead.
 */
export function ConstructionOverviewIntro() {
  return (
    <section className="border-border border-b">
      <Container>
        <div className="max-w-2xl py-28 sm:py-36">
          <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
            Construction
          </Reveal>
          <h1>
            <Reveal as="span" className="text-display-xl block">
              Real progress, not renderings.
            </Reveal>
          </h1>
          <Reveal delay={140}>
            <p className="text-body-lg text-fg-muted mt-8 max-w-md">
              Every active development, tracked stage by stage — the same
              updates buyers and landowners see, published openly.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
