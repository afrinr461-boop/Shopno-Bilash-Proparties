import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { milestones, storyFallback } from "@/content/about";

/**
 * Two states, same as <FeaturedDevelopment> on the homepage: a real
 * editorial timeline once `milestones` has entries, or an honest narrative
 * paragraph instead of inventing history while it's empty.
 */
export function OurStory() {
  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-8 uppercase">
          Our Story
        </Reveal>

        {milestones.length > 0 ? (
          <div>
            <Divider />
            {milestones.map((milestone, i) => (
              <Reveal key={milestone.year} delay={i * 60}>
                <div className="flex flex-col gap-2 py-8 sm:flex-row sm:items-baseline sm:gap-8">
                  <span className="text-label text-accent w-20 shrink-0 tabular-nums">
                    {milestone.year}
                  </span>
                  <h3 className="text-h4 w-full shrink-0 sm:w-56">{milestone.title}</h3>
                  <p className="text-body text-fg-muted max-w-lg">{milestone.description}</p>
                </div>
                <Divider />
              </Reveal>
            ))}
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
