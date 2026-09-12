import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { PROJECT_STATUS_LABEL, type Project } from "@/content/projects";

/**
 * A compact "part of a larger development" moment — not a second Project
 * Details page. Just enough to place this unit in context and invite the
 * visitor back to the full project story.
 */
export function UnitProjectContext({ project }: { project: Project }) {
  return (
    <Section spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-8 uppercase">
          Part Of
        </Reveal>

        <Reveal>
          <Link
            href={`/projects/${project.slug}`}
            className="group grid gap-8 sm:grid-cols-[2fr_3fr] sm:items-center sm:gap-12"
          >
            <Media
              ratio="standard"
              radius="md"
              src={project.coverImage.src}
              alt={project.coverImage.alt}
              sizes="(min-width: 640px) 40vw, 100vw"
              className="transition-transform duration-500 ease-[var(--ease-standard)] group-hover:scale-105"
            />
            <div>
              <p className="text-caption text-fg-subtle mb-2 uppercase">
                {project.location} · {PROJECT_STATUS_LABEL[project.status]}
              </p>
              <h3 className="text-h1 group-hover:text-accent transition-colors duration-200">
                {project.name}
              </h3>
              <p className="text-body text-fg-muted mt-3 max-w-md">{project.shortDescription}</p>
              <span className="text-button text-accent mt-6 inline-flex items-center gap-2">
                View Project
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}
