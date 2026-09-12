import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { UNIT_STATUS_LABEL, type Unit } from "@/content/units";

/** Plain-language rendering of the status — not fabricated per-unit data, just naming what the status means. */
const STATUS_NOTE: Record<Unit["status"], string> = {
  available: "This unit is currently available.",
  reserved: "This unit has been reserved by another buyer.",
  sold: "This unit has been sold.",
  "on-hold": "This unit is temporarily on hold.",
};

/**
 * Elevated but restrained — no discount-marketplace styling. Price only
 * renders when it actually exists in the data; never fabricated.
 */
export function UnitAvailabilityPrice({ unit }: { unit: Unit }) {
  return (
    <Section spacing="lg">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-label text-fg-subtle mb-6 uppercase">Availability</p>
            <p className="text-display-m">{UNIT_STATUS_LABEL[unit.status]}</p>
            <p className="text-body text-fg-muted mt-4 max-w-md">{STATUS_NOTE[unit.status]}</p>
          </Reveal>

          {unit.price && (
            <Reveal delay={100} className="lg:border-border lg:border-l lg:pl-16">
              <p className="text-label text-fg-subtle mb-6 uppercase">Price</p>
              <p className="text-display-m text-accent">{unit.price}</p>
              <p className="text-body-sm text-fg-subtle mt-4">
                Final pricing confirmed at the time of booking.
              </p>
            </Reveal>
          )}
        </div>
      </Container>
    </Section>
  );
}
