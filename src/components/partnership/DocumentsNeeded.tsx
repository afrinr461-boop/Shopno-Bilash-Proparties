import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { documentsNeeded } from "@/content/partnership";

/** What to have ready before reaching out — conceptual, not a document-upload flow. */
export function DocumentsNeeded() {
  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-12 uppercase">
          Before You Reach Out
        </Reveal>

        <div className="grid gap-12 sm:grid-cols-2 sm:gap-16">
          {[documentsNeeded.landowner, documentsNeeded.investor].map((group, gi) => (
            <Reveal key={group.title} delay={gi * 80}>
              <h3 className="text-h3 mb-5">{group.title}</h3>
              <ul className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <li key={item} className="text-body text-fg-muted border-border border-t pt-3">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
