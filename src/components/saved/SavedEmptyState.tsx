import Link from "next/link";
import { Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

/** Shown while nothing is saved yet — never blank, and never invents a "recommended for you" list. */
export function SavedEmptyState() {
  return (
    <Section spacing="lg">
      <Container>
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <div className="bg-surface text-fg-subtle flex size-16 items-center justify-center rounded-full">
            <Heart aria-hidden className="size-6" />
          </div>
          <Reveal>
            <p className="text-display-m max-w-md text-balance">Nothing saved yet.</p>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-body-lg text-fg-muted max-w-md">
              Tap the heart on any property to keep it here for later — it stays on this
              device until you remove it.
            </p>
          </Reveal>
          <Reveal delay={160} className="mt-2 flex flex-wrap justify-center gap-4">
            <Link href="/properties" className={buttonVariants({ size: "lg" })}>
              Explore Properties
            </Link>
            <Link href="/projects" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Explore Projects
            </Link>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
