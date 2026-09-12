import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { vision } from "@/content/about";

/** Left-aligned, not centered — deliberately different rhythm from the homepage's centered <CompanyStatement>. */
export function Vision() {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div>
            <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
              Our Vision
            </Reveal>
            <Reveal delay={80}>
              <p className="text-display-m max-w-2xl text-balance">{vision}</p>
            </Reveal>
          </div>

          <Reveal delay={120} className="hidden lg:block">
            <ArchitecturalMotif className="text-border-strong h-auto w-full" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
