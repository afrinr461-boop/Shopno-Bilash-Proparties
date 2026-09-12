import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import type { ConstructionMilestone, ConstructionProgress } from "@/content/construction";

const DOT_TONE: Record<ConstructionMilestone["status"], string> = {
  completed: "bg-accent",
  "in-progress": "bg-accent",
  upcoming: "bg-border-strong",
};

const STATUS_LABEL: Record<ConstructionMilestone["status"], string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  upcoming: "Upcoming",
};

/**
 * A connected vertical line with a dot per milestone — an editorial
 * timeline, not a table of cards. Only milestones actually present in the
 * data render; the whole section omits itself if there are none. The
 * "last updated" line is the brief's transparency note, folded in here
 * rather than given its own thin section.
 */
export function ConstructionTimeline({ progress }: { progress: ConstructionProgress }) {
  if (progress.milestones.length === 0) return null;

  return (
    <Section spacing="lg">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <Reveal as="p" className="text-label text-fg-subtle uppercase">
            Construction Timeline
          </Reveal>
          {progress.lastUpdated && (
            <Reveal delay={60} as="p" className="text-caption text-fg-subtle">
              Last updated {progress.lastUpdated}
            </Reveal>
          )}
        </div>

        <div className="relative">
          <div aria-hidden className="bg-border absolute top-2 bottom-2 left-[5px] w-px" />

          {progress.milestones.map((milestone, i) => (
            <Reveal key={milestone.title} delay={i * 60} className="relative flex gap-8 pb-12 last:pb-0">
              <span
                aria-hidden
                className={cn("relative z-10 mt-1.5 size-[11px] shrink-0 rounded-full", DOT_TONE[milestone.status])}
              />
              <div className="-mt-1 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="text-h3">{milestone.title}</h3>
                  <span className="text-label text-fg-subtle uppercase">
                    {STATUS_LABEL[milestone.status]}
                  </span>
                  {milestone.date && (
                    <span className="text-caption text-fg-subtle">{milestone.date}</span>
                  )}
                </div>
                {milestone.description && (
                  <p className="text-body text-fg-muted mt-2 max-w-xl">{milestone.description}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
