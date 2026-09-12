import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { expertise } from "@/content/about";

/**
 * A compact, unnumbered 2-column list — the internal competencies behind
 * the homepage's business-line list (<WhatWeDo>), not a repeat of it, so
 * kept visually quieter/denser rather than another full-width sequence.
 */
export function Expertise() {
  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-12 uppercase">
          Our Expertise
        </Reveal>

        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {expertise.map((item, i) => (
            <Reveal key={item.title} delay={i * 50}>
              <div className="border-border border-t pt-5">
                <h3 className="text-h4 mb-2">{item.title}</h3>
                <p className="text-body-sm text-fg-muted">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
