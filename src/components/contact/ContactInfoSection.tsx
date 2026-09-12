import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { contactInfo } from "@/content/contact";

/**
 * Renders nothing until real contact information exists — no invented
 * phone number, email, address or hours. Structured and ready: as soon as
 * any field in content/contact.ts's `contactInfo` is set, this section
 * (and a location panel, once a real address/map exists) appears
 * automatically with no further changes.
 */
export function ContactInfoSection() {
  const rows: { label: string; value: string }[] = [
    contactInfo.address ? { label: "Office", value: contactInfo.address } : null,
    contactInfo.phone ? { label: "Phone", value: contactInfo.phone } : null,
    contactInfo.email ? { label: "Email", value: contactInfo.email } : null,
    contactInfo.hours ? { label: "Hours", value: contactInfo.hours } : null,
  ].filter((r): r is { label: string; value: string } => r !== null);

  if (rows.length === 0) return null;

  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-10 uppercase">
          Reach Us Directly
        </Reveal>
        <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((row, i) => (
            <Reveal key={row.label} delay={i * 50} className="border-border border-t pt-5">
              <p className="text-label text-fg-subtle mb-2 uppercase">{row.label}</p>
              <p className="text-h4 flex items-center gap-2">
                {row.label === "Office" && <MapPin aria-hidden className="text-fg-subtle size-4 shrink-0" />}
                {row.value}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
