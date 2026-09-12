import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { trust } from "@/content/partnership";

/** A quiet numbered list, not a quote-plus-columns like About's Trust section — deliberate rhythm variation. */
export function TrustTransparency() {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-10 uppercase">
          Why Partners Trust This Process
        </Reveal>

        <div>
          <Divider />
          {trust.map((item, i) => (
            <Reveal key={item.title} delay={i * 50}>
              <div className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:gap-8">
                <h3 className="text-h4 w-full shrink-0 sm:w-64">{item.title}</h3>
                <p className="text-body text-fg-muted max-w-lg">{item.description}</p>
              </div>
              <Divider />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
