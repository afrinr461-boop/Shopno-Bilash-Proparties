import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { nextExploration } from "@/content/home";

/** Closing bridge into the Footer — large link list, not another CTA button row. */
export function NextExploration() {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-10 uppercase">
          Explore Further
        </Reveal>

        <div>
          <Divider />
          {nextExploration.map((item, i) => (
            <Reveal key={item.href} delay={i * 60}>
              <Link
                href={item.href}
                className="group flex items-center justify-between gap-6 py-7 transition-[padding] duration-300 ease-[var(--ease-standard)] hover:pl-3"
              >
                <span>
                  <span className="text-h2 block transition-colors duration-200 group-hover:text-accent">
                    {item.title}
                  </span>
                  <span className="text-body text-fg-muted mt-1 block">
                    {item.description}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="text-fg-subtle size-6 shrink-0 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
                />
              </Link>
              <Divider />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
