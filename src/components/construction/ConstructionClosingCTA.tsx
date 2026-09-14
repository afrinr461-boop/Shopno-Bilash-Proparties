import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SkylineBars } from "@/components/ui/SkylineBars";
import { cn } from "@/lib/utils";
import type { Project } from "@/content/projects";

/** Cinematic closing — connects the construction story back to the project and, when units exist, straight to the property experience (brief §9/§10). */
export function ConstructionClosingCTA({ project, hasUnits }: { project: Project; hasUnits: boolean }) {
  return (
    <section data-header-tone="dark" className="bg-fg relative overflow-hidden py-24 text-center sm:py-32 lg:py-40">
      <SkylineBars className="pointer-events-none absolute inset-0 hidden h-full w-full text-white/10 sm:block" />
      <Container className="relative">
        <Reveal as="p" className="text-label mb-6 text-white/60 uppercase">
          {project.name}
        </Reveal>
        <Reveal delay={80}>
          <p className="text-display-l mx-auto max-w-3xl text-balance text-white">
            Watch this project take shape.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={`/projects/${project.slug}`} className={buttonVariants({ size: "lg" })}>
              View Project
            </Link>
            {hasUnits && (
              <Link
                href={`/properties?project=${encodeURIComponent(project.slug)}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/35 text-white hover:border-white/70 hover:bg-white/10",
                )}
              >
                Explore Available Units
              </Link>
            )}
            <Link
              href={`/contact?project=${encodeURIComponent(project.name)}&type=construction`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/35 text-white hover:border-white/70 hover:bg-white/10",
              )}
            >
              Discuss This Project
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
