import { ChevronDown } from "lucide-react";
import { BlueprintDiagram } from "@/components/ui/BlueprintDiagram";
import { SkylineBars } from "@/components/ui/SkylineBars";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { values } from "@/content/about";

/**
 * Native <details>/<summary> accordion — expand-on-click per the brief,
 * with zero JS: keyboard-operable and screen-reader-announced for free.
 * Nothing is hidden from search/SEO either, since the content is in the
 * DOM either way, just visually collapsed.
 */
export function Values() {
  return (
    <Section spacing="lg" background="surface">
      <Container size="narrow">
        <Reveal as="p" className="text-label text-fg-subtle mb-8 uppercase">
          Our Values
        </Reveal>

        <div className="relative">
          <Reveal delay={150} className="pointer-events-none absolute inset-y-0 right-full mr-12 hidden w-56 flex-col items-center justify-center gap-5 xl:flex">
            <BlueprintDiagram className="text-border-strong h-auto w-full" />
            <p className="text-caption text-fg-subtle text-center uppercase">Principle, Drawn To Scale</p>
          </Reveal>
          <Reveal delay={200} className="pointer-events-none absolute inset-y-0 left-full ml-12 hidden w-56 flex-col items-center justify-center gap-5 xl:flex">
            <SkylineBars className="text-border-strong h-32 w-full" />
            <p className="text-caption text-fg-subtle text-center uppercase">Held To One Standard</p>
          </Reveal>
          <Divider />
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 50}>
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                  <span className="text-h3">{value.title}</span>
                  <ChevronDown
                    aria-hidden
                    className="text-fg-subtle size-5 shrink-0 transition-transform duration-200 ease-[var(--ease-standard)] group-open:rotate-180"
                  />
                </summary>
                <p className="text-body text-fg-muted mt-4 max-w-xl">{value.description}</p>
              </details>
              <Divider />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
