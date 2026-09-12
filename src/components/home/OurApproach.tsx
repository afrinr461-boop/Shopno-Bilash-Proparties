import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { approach } from "@/content/home";

/**
 * Company manifesto, not an "About Us" card: one large statement, a slim
 * architectural detail (a single close-cropped elevation, not the full
 * skyline used elsewhere — a quieter echo, not a repeat) and the principles
 * behind it. Three parts on one row is what keeps this from reading as a
 * generic two-column text block.
 */
export function OurApproach() {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[3fr_1fr_2fr] lg:gap-12">
          <Reveal>
            <p className="text-label text-fg-subtle mb-6 uppercase">Our Approach</p>
            <p className="text-display-m max-w-xl text-balance">{approach.statement}</p>
          </Reveal>

          <Reveal delay={80} className="hidden lg:block">
            <ArchitecturalMotif fit="cover" className="text-border-strong h-full w-full" />
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            {approach.principles.map((principle, i) => (
              <Reveal key={principle.title} delay={100 + i * 80}>
                <h3 className="text-h4 mb-2">{principle.title}</h3>
                <p className="text-body text-fg-muted">{principle.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
