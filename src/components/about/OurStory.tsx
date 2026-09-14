import { MoreHorizontal } from "lucide-react";
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
    <Section
      spacing="lg"
      background="surface"
      // A faint blueprint-grid wash — the same technical-drawing language
      // `<BlueprintDiagram>`/`<ArchitecturalMotif>` already speak elsewhere
      // in this app, here as a barely-there texture instead of a line
      // illustration, so the section reads as considered rather than a
      // flat, empty block. Radial fade keeps it from tiling edge-to-edge
      // like a repeating pattern would.
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--color-border-strong) 1px, transparent 1px), radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--color-accent) 6%, transparent), transparent 70%)",
        backgroundSize: "28px 28px, 100% 100%",
      }}
    >
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

              {/* Closes the rail with an open-ended "to be continued" beat instead of
                  just stopping — also keeps the column from trailing off into bare
                  whitespace under a short list. */}
              <Reveal delay={milestones.length * 80} className="flex gap-6 sm:gap-8">
                <span
                  aria-hidden
                  className="text-fg-subtle border-border-strong flex size-12 shrink-0 items-center justify-center rounded-full border border-dashed sm:size-14"
                >
                  <MoreHorizontal className="size-5 sm:size-6" />
                </span>
                <p className="text-body text-fg-subtle max-w-lg pt-1 italic">
                  Every year adds a new chapter — the next one is already underway.
                </p>
              </Reveal>
            </div>
            <Reveal delay={120} className="hidden lg:block">
              <div className="sticky top-32">
                <GrowthPathMotif className="text-border-strong h-auto w-full" />

                {/* Grounds the motif in the real data next to it instead of leaving
                    it as unlabelled decoration — also what actually fills the
                    column, since the graphic alone falls short of the timeline's
                    height once there are more than a couple of entries. */}
                <div className="border-border-strong mt-8 border-t pt-6">
                  <p className="text-body text-fg-muted max-w-sm">
                    A timeline built one real milestone at a time — not a marketing
                    checkpoint added for the sake of one.
                  </p>
                  <div className="mt-6 flex gap-10">
                    <div>
                      <p className="text-h3 text-accent tabular-nums">{milestones.length}</p>
                      <p className="text-label text-fg-subtle mt-1 uppercase">Chapters told</p>
                    </div>
                    <div>
                      <p className="text-h3 text-accent tabular-nums">{milestones[0]?.year}</p>
                      <p className="text-label text-fg-subtle mt-1 uppercase">Since</p>
                    </div>
                  </div>
                </div>
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
