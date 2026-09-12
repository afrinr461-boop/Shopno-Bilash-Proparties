import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import type { ConstructionProgress } from "@/content/construction";
import type { Project } from "@/content/projects";

interface TrackedProject {
  project: Project;
  progress: ConstructionProgress;
}

export function ConstructionOverviewGrid({ items }: { items: TrackedProject[] }) {
  if (items.length === 0) {
    return (
      <Section spacing="lg" background="surface">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
            <div>
              <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
                Updates
              </Reveal>
              <Reveal delay={80}>
                <p className="text-display-m max-w-xl text-balance">
                  Construction updates are being prepared for publication.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-body-lg text-fg-muted mt-6 max-w-md">
                  Check back soon, or get in touch to ask about a specific
                  project&rsquo;s progress.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <Link
                  href="/contact?type=construction"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-8")}
                >
                  Ask About a Project
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

  return (
    <Section spacing="lg">
      <Container>
        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2">
          {items.map(({ project, progress }, i) => (
            <Reveal key={project.slug} delay={i * 80}>
              <Link href={`/projects/${project.slug}/construction`} className="group flex flex-col">
                <Media
                  ratio="standard"
                  radius="md"
                  src={project.coverImage.src}
                  alt={project.coverImage.alt}
                  className="transition-transform duration-500 ease-[var(--ease-standard)] group-hover:scale-105"
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
                <div className="mt-5 flex flex-1 flex-col">
                  <p className="text-caption text-fg-subtle uppercase">
                    {project.location} · {progress.currentPhase ?? PROJECT_STATUS_FALLBACK}
                  </p>
                  <h3 className="text-h3 mt-1.5 group-hover:text-accent transition-colors duration-200">
                    {project.name}
                  </h3>

                  {progress.overallProgress !== undefined && (
                    <div className="mt-4">
                      <div className="bg-border relative h-px w-full overflow-hidden">
                        <div
                          className="bg-accent absolute inset-y-0 left-0"
                          style={{ width: `${progress.overallProgress}%` }}
                        />
                      </div>
                      <p className="text-caption text-fg-subtle mt-2 tabular-nums">
                        {progress.overallProgress}% complete
                      </p>
                    </div>
                  )}

                  <span className="text-button text-fg mt-auto inline-flex items-center gap-1.5 pt-6">
                    View Construction Updates
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

const PROJECT_STATUS_FALLBACK = "In Progress";
