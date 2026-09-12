import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { closingStatement } from "@/content/contact";

/**
 * A quiet closing beat before the Footer — the page otherwise ends the
 * instant the form does, with no <ContactInfoSection> yet to fill the gap
 * (no real office/phone/email exists). One line of real brand voice and a
 * small elevation detail, not another CTA.
 */
export function ContactClosing() {
  return (
    <Section spacing="md">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <Reveal>
            <p className="text-display-m max-w-xl text-balance">{closingStatement}</p>
          </Reveal>
          <Reveal delay={100} className="hidden lg:block">
            <ArchitecturalMotif className="text-border-strong h-auto w-full" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
