import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { services } from "@/content/services";

/**
 * The overview — every service as one numbered row, not eight identical
 * cards. Featured services also get a full chapter further down the page;
 * "Explore" here jumps straight to that chapter (`#id`) rather than away
 * from the page. Non-featured rows route straight to where that service
 * actually lives (Properties, Landowners, Contact).
 */
export function ServiceIndex() {
  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-12 uppercase">
          Every Way to Work With Us
        </Reveal>

        <div>
          <Divider />
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 50}>
              <Link
                href={service.featured ? `#${service.id}` : service.ctaHref}
                className="group flex flex-col gap-3 py-8 transition-[padding] duration-300 ease-[var(--ease-standard)] hover:pl-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="flex items-baseline gap-6 sm:gap-8">
                  <span className="text-label text-fg-subtle w-8 shrink-0 tabular-nums transition-colors duration-300 group-hover:text-accent">
                    {service.number}
                  </span>
                  <span>
                    <span className="text-h2 block transition-colors duration-200 group-hover:text-accent">
                      {service.title}
                    </span>
                    <span className="text-body text-fg-muted mt-2 block max-w-lg">{service.description}</span>
                  </span>
                </span>
                <span className="text-button text-fg-subtle ml-14 inline-flex shrink-0 items-center gap-2 transition-colors duration-200 group-hover:text-accent sm:ml-0">
                  {service.featured ? "Read More" : "Explore"}
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
