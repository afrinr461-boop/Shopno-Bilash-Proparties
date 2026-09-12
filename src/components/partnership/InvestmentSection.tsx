import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { investment } from "@/content/partnership";

/** Deliberately careful language — no guaranteed-return claims, no fixed figures. Each point is a plain statement of how opportunities actually work, not a pitch. */
export function InvestmentSection() {
  return (
    <Section id="investment" spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
          For Investors &amp; Development Partners
        </Reveal>
        <Reveal delay={60}>
          <p className="text-display-m max-w-2xl text-balance">{investment.statement}</p>
        </Reveal>

        <div className="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {investment.points.map((point, i) => (
            <Reveal key={point} delay={100 + i * 50}>
              <p className="text-body text-fg-muted border-border border-t pt-5">{point}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100 + investment.points.length * 50} className="mt-12">
          <Link
            href="/contact?type=investment"
            className="text-button text-accent hover:text-accent-strong inline-flex items-center gap-2"
          >
            Discuss an Opportunity
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}
