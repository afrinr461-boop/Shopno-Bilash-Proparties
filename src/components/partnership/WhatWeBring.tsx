import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { capabilities } from "@/content/partnership";

/** Compact, unnumbered 2-column list — same quiet density as About's Expertise section, distinct from Home's full-width numbered rows. A slim elevation detail on the right keeps this from being pure text, without repeating <ProjectOpportunities>'s real photography further down. */
export function WhatWeBring() {
  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-12 uppercase">
          What We Bring
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_2fr] lg:gap-12">
          <div className="grid gap-y-10 sm:grid-cols-2 lg:grid-cols-1">
            {capabilities.slice(0, Math.ceil(capabilities.length / 2)).map((item, i) => (
              <Reveal key={item.title} delay={i * 50}>
                <div className="border-border border-t pt-5">
                  <h3 className="text-h4 mb-2">{item.title}</h3>
                  <p className="text-body-sm text-fg-muted">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={80} className="hidden lg:block">
            <ArchitecturalMotif fit="cover" className="text-border-strong h-full w-full" />
          </Reveal>

          <div className="grid gap-y-10 sm:grid-cols-2 lg:grid-cols-1">
            {capabilities.slice(Math.ceil(capabilities.length / 2)).map((item, i) => (
              <Reveal key={item.title} delay={100 + i * 50}>
                <div className="border-border border-t pt-5">
                  <h3 className="text-h4 mb-2">{item.title}</h3>
                  <p className="text-body-sm text-fg-muted">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
