import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { StatCounter } from "@/components/home/StatCounter";

export interface ProjectsBridgeStats {
  developmentCount: number;
  cityCount: number;
  activeCount: number;
}

const APPROACH_POINTS = [
  {
    label: "Place",
    description:
      "Every project grouped by the city and neighborhood it's actually built in. Start with a location and you're already looking at homes near what matters to you.",
    offset: "lg:mt-0",
  },
  {
    label: "Type",
    description:
      "Residential, commercial or serviced plots — never mixed into one generic list. Each type carries its own filters, so you're never wading through homes you were never looking for.",
    offset: "lg:mt-10",
  },
  {
    label: "Progress",
    description:
      "Planning, under construction or delivered — so status is never a guess. Every stage is tracked and shown plainly, from the first agreement to final handover.",
    offset: "lg:mt-4",
  },
] as const;

/**
 * A calm, cream-toned statement break between the intro and the listing —
 * plain color, no dark panel or imagery, per the user's explicit request.
 * The three points on the right spell out the statement's own "place,
 * type and progress" directly (real copy, not decoration standing in for
 * it). The dashed rail + tag dots above them echoes the site's own
 * sorted/tagged-card visual language (the same device the "cool" abstract
 * version used) — here it doubles as a real connector to three real
 * cards, staggered in height, rather than a purely decorative grid.
 */
export function ProjectsBridge({ stats }: { stats: ProjectsBridgeStats }) {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
              Our Approach
            </Reveal>
            <Reveal delay={80}>
              <p className="text-display-m text-fg max-w-2xl text-balance">
                A development is more than a listing. We organize ours by
                place, purpose and progress.
              </p>
            </Reveal>

            <Reveal delay={200} className="border-border mt-10 grid grid-cols-3 gap-6 border-t pt-8 sm:gap-10">
              <StatCounter label="Developments" value={stats.developmentCount} />
              <StatCounter label="Cities" value={stats.cityCount} />
              <StatCounter label="Currently Building" value={stats.activeCount} />
            </Reveal>
          </div>

          <div>
            <Reveal delay={140} className="relative mb-8 hidden items-center lg:flex">
              <span aria-hidden className="border-border-strong h-px flex-1 border-t border-dashed" />
              <div aria-hidden className="absolute inset-0 flex items-center justify-around px-8">
                {APPROACH_POINTS.map((point) => (
                  <span key={point.label} className="bg-premium size-2 rounded-full" />
                ))}
              </div>
            </Reveal>

            <div className="grid gap-5 lg:grid-cols-3">
              {APPROACH_POINTS.map((point, i) => (
                <Reveal key={point.label} delay={200 + i * 100} className={point.offset}>
                  <div className="border-border bg-surface-raised relative overflow-hidden rounded-xl border p-7 shadow-sm sm:p-8">
                    <span aria-hidden className="bg-premium absolute inset-x-0 top-0 h-1" />
                    <span className="text-premium text-label">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-h3 text-fg mt-4">{point.label}</p>
                    <p className="text-body-sm text-fg-muted mt-3 leading-relaxed">{point.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
