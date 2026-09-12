import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { process } from "@/content/about";

/**
 * Four-step horizontal sequence — visually distinct from the homepage's
 * full-width numbered <WhatWeDo> rows (compact columns with a connecting
 * rule instead), so the two numbered lists don't feel like the same
 * component reused.
 */
export function Process() {
  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-12 uppercase">
          How We Work
        </Reveal>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {process.map((step, i) => (
            <Reveal key={step.title} delay={i * 80}>
              <div className="lg:border-border lg:border-l lg:pl-6 lg:pr-4">
                <span className="text-label text-fg-subtle tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-h3 mt-3 mb-2">{step.title}</h3>
                <p className="text-body text-fg-muted">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
