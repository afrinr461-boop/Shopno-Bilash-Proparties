import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { Unit } from "@/content/units";

/** An editorial treatment of the (real, not generated) description — large statement + supporting text + feature highlights. */
export function UnitDescription({ unit }: { unit: Unit }) {
  const features = unit.features ?? [];

  return (
    <Section spacing="lg">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-20">
          <Reveal>
            <p className="text-display-m max-w-xl text-balance">{unit.shortDescription}</p>
            <p className="text-body-lg text-fg-muted mt-8 max-w-xl">{unit.description}</p>
          </Reveal>

          {features.length > 0 && (
            <Reveal delay={100}>
              <p className="text-label text-fg-subtle mb-5 uppercase">Highlights</p>
              <div className="flex flex-col gap-3">
                {features.map((feature) => (
                  <p key={feature} className="text-body border-border border-t pt-3">
                    {feature}
                  </p>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </Section>
  );
}
