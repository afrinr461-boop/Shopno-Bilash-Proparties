import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { featuredProject } from "@/content/home";
import { projectContentRepository } from "@/features/projectContent/repository";

/**
 * A slim filmstrip bridging <WhatWeDo> into <FeaturedDevelopment> — real
 * project thumbnails, names and locations (never invented), building
 * anticipation before the single spotlighted project below rather than
 * cutting straight from a numbered text list into the next dark panel.
 * Excludes whichever project is already spotlighted there, so nothing
 * repeats itself back to back.
 */
export async function PortfolioStrip() {
  const projects = await projectContentRepository.list();
  const strip = projects.filter((p) => p.name !== featuredProject?.name).slice(0, 4);
  if (strip.length === 0) return null;

  return (
    <Section spacing="sm">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-8 uppercase">
          Our Portfolio
        </Reveal>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {strip.map((project, i) => (
            <Reveal key={project.slug} delay={i * 70}>
              <Link href={`/projects/${project.slug}`} className="group block">
                <Media
                  ratio="square"
                  radius="md"
                  src={project.coverImage.src}
                  alt={project.coverImage.alt}
                  className="transition-transform duration-500 ease-[var(--ease-standard)] group-hover:scale-105"
                  sizes="(min-width: 1024px) 22vw, 45vw"
                />
                <p className="text-label text-fg-subtle mt-4 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-h4 group-hover:text-accent mt-1 transition-colors duration-200">
                  {project.name}
                </p>
                <p className="text-caption text-fg-subtle mt-1 uppercase">{project.location}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
