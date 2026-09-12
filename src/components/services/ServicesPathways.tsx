import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { pathways } from "@/content/services";

/**
 * The practical payoff of the whole page: "here's what you actually came
 * for" as a short list of real intents mapped to real destinations, so a
 * visitor never has to reverse-engineer which service applies to them.
 */
export function ServicesPathways() {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-10 uppercase">
          Not Sure Where to Start?
        </Reveal>

        <div>
          <Divider />
          {pathways.map((pathway, i) => (
            <Reveal key={pathway.prompt} delay={i * 60}>
              <Link
                href={pathway.href}
                className="group flex items-center justify-between gap-6 py-7 transition-[padding] duration-300 ease-[var(--ease-standard)] hover:pl-3"
              >
                <span className="text-h4 sm:text-h3">{pathway.prompt}</span>
                <span className="text-button text-accent inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
                  {pathway.label}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:translate-x-1"
                  />
                </span>
              </Link>
              <Divider />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
