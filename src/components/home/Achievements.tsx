import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { stats } from "@/content/home";
import { StatCounter } from "./StatCounter";

/** Framed like a ledger, not a floating row of numbers — an eyebrow and hairline rules give the stats a header the way every other section on the page has one. */
export function Achievements() {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-10 uppercase">
          Track Record
        </Reveal>
        <Divider />
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <StatCounter {...stat} />
            </Reveal>
          ))}
        </div>
        <Divider />
      </Container>
    </Section>
  );
}
