import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { services } from "@/content/services";

/**
 * "How you can work with us" — built directly on `content/services.ts`
 * (itself built on the homepage's `capabilities`), never a second list of
 * business lines that could quietly drift from what Services already
 * says. Only adds framing copy and links; the six lines themselves are
 * the single source of truth used everywhere else on the site.
 */
export function BusinessModels() {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <div className="max-w-2xl">
          <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
            Ways to Work With Us
          </Reveal>
          <Reveal>
            <p className="text-display-m text-balance">Six ways to work with Shopno Bilash Properties.</p>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-body-lg text-fg-muted mt-6">
              As a buyer, a landowner, an investor, or a partner — each is a distinct way of
              working with us, not a one-size-fits-all pitch.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 60}>
              <Link href={service.ctaHref} className="group flex flex-col">
                <span className="text-caption text-fg-subtle tabular-nums">{service.number}</span>
                <h3 className="text-h4 mt-3 group-hover:text-accent transition-colors duration-200">
                  {service.title}
                </h3>
                <p className="text-body-sm text-fg-muted mt-2 flex-1">{service.description}</p>
                <span className="text-button text-fg mt-4 inline-flex items-center gap-1.5">
                  {service.ctaLabel}
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
