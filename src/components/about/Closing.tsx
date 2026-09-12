import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { closing } from "@/content/about";

/** Final beat of the page — one statement, two ways to act on it. */
export function Closing() {
  return (
    <Section spacing="lg">
      <Container size="narrow" className="text-center">
        <Reveal>
          <p className="text-display-m text-balance">{closing.statement}</p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/projects" className={buttonVariants({ size: "lg" })}>
              Explore Projects
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Get in Touch
            </Link>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
