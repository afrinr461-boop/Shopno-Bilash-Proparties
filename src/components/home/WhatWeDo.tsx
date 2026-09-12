import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { NetworkMotif } from "@/components/ui/NetworkMotif";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { capabilities } from "@/content/home";

/**
 * The business's breadth as a numbered editorial list rather than a grid
 * of six identical cards — each row gets full-width attention, and the
 * hover state (desktop only, pure CSS) is a subtle emphasis, never a way
 * to hide content, so nothing depends on it. A `<NetworkMotif>` — "many
 * services, one company" — fills the wide right-hand gutter this list
 * otherwise leaves empty on desktop (the list's own columns cap out well
 * short of the container's full width).
 */
export function WhatWeDo() {
  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-12 uppercase">
          What We Do
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <div>
            <Divider />
            {capabilities.map((capability, i) => (
              <Reveal key={capability.title} delay={i * 60}>
                <div className="group flex flex-col gap-2 py-8 transition-[padding] duration-300 ease-[var(--ease-standard)] hover:pl-3 sm:flex-row sm:items-baseline sm:gap-8">
                  <span className="text-label text-fg-subtle w-10 shrink-0 tabular-nums transition-colors duration-300 group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-h3 w-full shrink-0 sm:w-72">{capability.title}</h3>
                  <p className="text-body text-fg-muted max-w-lg">{capability.description}</p>
                </div>
                <Divider />
              </Reveal>
            ))}
          </div>

          <Reveal delay={150} className="hidden lg:block">
            <div className="sticky top-32 flex flex-col items-center gap-6 pt-4">
              <NetworkMotif className="text-border-strong h-auto w-full" />
              <p className="text-caption text-fg-subtle text-center uppercase">One Company, Every Stage</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
