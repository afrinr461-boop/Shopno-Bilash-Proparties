import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { trust } from "@/content/home";

/**
 * Deliberately a different composition from <WhatWeDo> (a quote-style
 * statement + three columns, not another numbered list) so the page keeps
 * visual rhythm rather than repeating the same section shape.
 */
export function Trust() {
  return (
    <Section spacing="lg">
      <Container>
        <Reveal>
          <p className="text-display-m max-w-2xl text-balance">{trust.statement}</p>
        </Reveal>

        <div className="mt-16">
          <Divider />
          <div className="grid gap-10 py-10 sm:grid-cols-3 sm:gap-8">
            {trust.pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 80}>
                <h3 className="text-h4 mb-2">{pillar.title}</h3>
                <p className="text-body-sm text-fg-muted">{pillar.description}</p>
              </Reveal>
            ))}
          </div>
          <Divider />
        </div>
      </Container>
    </Section>
  );
}
