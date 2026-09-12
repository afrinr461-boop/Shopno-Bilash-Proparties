import { StatCounter } from "@/components/home/StatCounter";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { impactStats } from "@/content/about";

/** Reuses <StatCounter> from the homepage — same honest null-placeholder behavior, a different cut of stats. */
export function Impact() {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-10 uppercase">
          Our Impact
        </Reveal>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {impactStats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <StatCounter {...stat} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
