import { BadgeCheck, Milestone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { FounderProfile } from "@/types/founderProfile";

export interface FounderPrinciplesProps {
  profile: FounderProfile;
}

/**
 * Leadership principles/core beliefs alongside milestones — two short
 * lists, not one long one, so "what I believe" and "what's happened" read
 * as distinct kinds of fact. Each half only renders when it has content;
 * the section itself is skipped when both are empty.
 */
export function FounderPrinciples({ profile }: FounderPrinciplesProps) {
  const hasPrinciples = profile.principles.length > 0;
  const hasHighlights = profile.highlights.length > 0;
  if (!hasPrinciples && !hasHighlights) return null;

  return (
    <Section spacing="lg" background="surface">
      <Container>
        <div className={hasPrinciples && hasHighlights ? "grid gap-12 lg:grid-cols-2 lg:gap-16" : ""}>
          {hasPrinciples && (
            <div>
              <Reveal as="p" className="text-label text-premium mb-8 uppercase">
                Leadership Principles
              </Reveal>
              <ul className="flex flex-col gap-5">
                {profile.principles.map((principle, i) => (
                  <Reveal key={principle} delay={i * 60} as="li" className="text-body text-fg flex items-start gap-3">
                    <BadgeCheck aria-hidden className="text-premium mt-0.5 size-5 shrink-0" />
                    {principle}
                  </Reveal>
                ))}
              </ul>
            </div>
          )}

          {hasHighlights && (
            <div>
              <Reveal as="p" className="text-label text-premium mb-8 uppercase">
                Milestones
              </Reveal>
              <ul className="flex flex-col gap-5">
                {profile.highlights.map((highlight, i) => (
                  <Reveal key={highlight} delay={i * 60} as="li" className="text-body text-fg flex items-start gap-3">
                    <Milestone aria-hidden className="text-fg-muted mt-0.5 size-5 shrink-0" />
                    {highlight}
                  </Reveal>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
