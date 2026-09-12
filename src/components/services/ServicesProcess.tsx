import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { process } from "@/content/about";

/**
 * Reuses <content/about.ts>'s `process` (Discover/Plan/Build/Deliver) — the
 * company's one real process, already established on the About page — in a
 * third distinct composition: oversized numbers leading each step with a
 * connecting top rule, rather than About's left-border columns or the
 * Landowners page's vertical connected line, so this doesn't just look like
 * a copy-pasted section.
 */
export function ServicesProcess() {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-14 uppercase">
          How a Project Actually Moves
        </Reveal>

        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <Reveal key={step.title} delay={i * 80} className="border-border-strong border-t pt-6">
              <span className="text-stat-lg text-accent block tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-h3 mt-3">{step.title}</h3>
              <p className="text-body-sm text-fg-muted mt-2">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
