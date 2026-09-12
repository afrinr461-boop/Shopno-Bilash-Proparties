import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { statement } from "@/content/partnership";

export function PartnershipStatement() {
  return (
    <Section spacing="lg">
      <Container size="narrow">
        <Reveal as="p" className="text-display-l text-center text-balance">
          {statement}
        </Reveal>
      </Container>
    </Section>
  );
}
