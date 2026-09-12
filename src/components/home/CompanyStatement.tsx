import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { companyStatement } from "@/content/home";

/**
 * The one-line thesis of the whole homepage — deliberately the smallest
 * amount of content on the page, carried entirely by scale and whitespace.
 * Echoes the Hero's "keep promises" line on purpose (a recurring thread,
 * not a repeated sentence).
 */
export function CompanyStatement() {
  return (
    <Section spacing="lg">
      <Container size="narrow">
        <Reveal as="p" className="text-display-l text-center text-balance">
          {companyStatement}
        </Reveal>
      </Container>
    </Section>
  );
}
