import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { Unit } from "@/content/units";

/** Same spec-sheet philosophy as <ProjectFacts>: only fields that actually exist render. */
export function UnitSpecifications({ unit }: { unit: Unit }) {
  const specs: { label: string; value: string }[] = [
    unit.unitNumber ? { label: "Unit", value: unit.unitNumber } : null,
    unit.floor !== undefined ? { label: "Floor", value: String(unit.floor) } : null,
    { label: "Type", value: unit.unitType },
    unit.area ? { label: "Area", value: unit.area } : null,
    unit.bedrooms !== undefined ? { label: "Bedrooms", value: String(unit.bedrooms) } : null,
    unit.bathrooms !== undefined ? { label: "Bathrooms", value: String(unit.bathrooms) } : null,
    unit.balconies !== undefined ? { label: "Balconies", value: String(unit.balconies) } : null,
    unit.parking !== undefined ? { label: "Parking", value: String(unit.parking) } : null,
    unit.facing ? { label: "Facing", value: unit.facing } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

  return (
    <Section spacing="md" background="surface">
      <Container>
        <Divider />
        <div className="flex flex-wrap">
          {specs.map((spec, i) => (
            <Reveal
              key={spec.label}
              delay={i * 40}
              className="border-border w-1/2 border-r py-8 pr-6 sm:w-1/3 lg:w-auto lg:flex-1 lg:border-r lg:last:border-r-0"
            >
              <p className="text-label text-fg-subtle mb-2 uppercase">{spec.label}</p>
              <p className="text-h3">{spec.value}</p>
            </Reveal>
          ))}
        </div>
        <Divider />
      </Container>
    </Section>
  );
}
