import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { UNIT_STATUS_LABEL, type Unit } from "@/content/units";

/**
 * A short editorial list, not a marketplace grid — reuses the same link-row
 * language as the homepage's <NextExploration>. Omits itself when there
 * are no other units in this project to show.
 */
export function UnitRelated({ units, projectSlug }: { units: Unit[]; projectSlug: string }) {
  if (units.length === 0) return null;

  return (
    <Section spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-8 uppercase">
          Other Units In This Project
        </Reveal>

        <div>
          <Divider />
          {units.slice(0, 3).map((unit, i) => (
            <Reveal key={unit.id} delay={i * 60}>
              <Link
                href={`/projects/${projectSlug}/units/${unit.slug}`}
                className="group flex items-center justify-between gap-6 py-6 transition-[padding] duration-300 ease-[var(--ease-standard)] hover:pl-3"
              >
                <span>
                  <span className="text-h3 block transition-colors duration-200 group-hover:text-accent">
                    {unit.name}
                  </span>
                  <span className="text-body-sm text-fg-muted mt-1 block">
                    {unit.unitType} · {UNIT_STATUS_LABEL[unit.status]}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="text-fg-subtle size-5 shrink-0 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:translate-x-1 group-hover:text-accent"
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
