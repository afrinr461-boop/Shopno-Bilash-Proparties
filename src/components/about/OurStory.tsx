import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { GrowthPathMotif } from "@/components/ui/GrowthPathMotif";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { storyFallback } from "@/content/about";
import { MilestoneEntry } from "./MilestoneEntry";
import type { CompanyMilestone } from "@/types/companyMilestone";

/**
 * Two states, same as <FeaturedDevelopment> on the homepage: a real,
 * admin-authored timeline (Admin → Content → Our Story) once entries exist,
 * or an honest narrative paragraph instead of inventing history while
 * it's empty.
 */
export function OurStory({ milestones }: { milestones: CompanyMilestone[] }) {
  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-8 uppercase">
          Our Story
        </Reveal>

        {milestones.length > 0 ? (
          <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
            <div>
              {milestones.map((milestone, i) => (
                <MilestoneEntry
                  key={milestone.id}
                  milestone={milestone}
                  delay={i * 80}
                  isLast={i === milestones.length - 1}
                />
              ))}
            </div>
            <Reveal delay={120} className="hidden lg:block">
              <div className="sticky top-32">
                <GrowthPathMotif className="text-border-strong h-auto w-full" />
              </div>
            </Reveal>
          </div>
        ) : (
          <div className="grid items-center gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
            <Reveal>
              <p className="text-display-m text-balance">{storyFallback}</p>
            </Reveal>
            <Reveal delay={120} className="hidden lg:block">
              <ArchitecturalMotif className="text-border-strong h-auto w-full" />
            </Reveal>
          </div>
        )}
      </Container>
    </Section>
  );
}
