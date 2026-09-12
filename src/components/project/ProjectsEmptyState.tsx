import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

/**
 * Shown only while `content/projects.ts`'s `projects` array is empty (no
 * real developments published yet) — an honest state, not a broken-looking
 * one. Same asymmetric text + skyline-motif composition already
 * established on the About page, for consistency rather than inventing a
 * new pattern for one more empty moment.
 */
export function ProjectsEmptyState() {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div>
            <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
              Catalog
            </Reveal>
            <Reveal delay={80}>
              <p className="text-display-m max-w-xl text-balance">
                Our project catalog is being prepared for publication.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-body-lg text-fg-muted mt-6 max-w-md">
                Check back soon, or get in touch to learn what we&rsquo;re
                currently building.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <Link
                href="/contact"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-8")}
              >
                Get in Touch
              </Link>
            </Reveal>
          </div>

          <Reveal delay={120} className="hidden lg:block">
            <ArchitecturalMotif className="text-border-strong h-auto w-full" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
