import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { ConstructionProgress } from "@/content/construction";

/**
 * Two halves, one section: "Currently" (the latest recorded update) and
 * "Coming Up" (milestones still marked upcoming) — the same asymmetric
 * two-halves pattern already used for Project status/availability, so the
 * page doesn't invent a new layout language for "now vs. next".
 */
export function ConstructionCurrentAndUpcoming({ progress }: { progress: ConstructionProgress }) {
  const latest = progress.updates[progress.updates.length - 1];
  const upcoming = progress.milestones.filter((m) => m.status === "upcoming");

  if (!latest && upcoming.length === 0) return null;

  return (
    <Section spacing="lg">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {latest && (
            <Reveal>
              <p className="text-label text-fg-subtle mb-6 uppercase">Currently</p>
              <p className="text-display-m mb-6">{latest.phase}</p>
              {latest.images[0] && (
                <Media
                  ratio="standard"
                  radius="md"
                  src={latest.images[0].src}
                  alt={latest.images[0].alt}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="mb-5"
                />
              )}
              <p className="text-body text-fg-muted max-w-md">{latest.description}</p>
              <p className="text-caption text-fg-subtle mt-3">{latest.date}</p>
            </Reveal>
          )}

          {upcoming.length > 0 && (
            <Reveal delay={100} className="lg:border-border lg:border-l lg:pl-16">
              <p className="text-label text-fg-subtle mb-6 uppercase">Coming Up</p>
              <div className="flex flex-col gap-6">
                {upcoming.map((milestone) => (
                  <div key={milestone.title} className="border-border border-t pt-5">
                    <h3 className="text-h4">{milestone.title}</h3>
                    {milestone.description && (
                      <p className="text-body-sm text-fg-muted mt-2">{milestone.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </Section>
  );
}
