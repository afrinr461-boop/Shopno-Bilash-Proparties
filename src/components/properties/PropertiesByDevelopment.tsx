import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { getProjectsWithListings, type PropertyListing } from "@/lib/properties";

/**
 * The reverse direction of the Project → Property link on
 * <ProjectStatusAndAvailability>: from here, a visitor moves back up to the
 * development a property belongs to (brief §9). Links to the project page
 * itself, not a pre-filtered /properties view — the destination genuinely
 * is "tell me about this development," which the project page answers.
 */
export function PropertiesByDevelopment({ listings }: { listings: PropertyListing[] }) {
  const developments = getProjectsWithListings(listings).map((project) => {
    const inProject = listings.filter((l) => l.project.slug === project.slug);
    const availableCount = inProject.filter((l) => l.status === "available").length;
    return { project, total: inProject.length, availableCount };
  });

  if (developments.length === 0) return null;

  return (
    <Section spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-10 uppercase">
          Explore by Development
        </Reveal>

        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {developments.map(({ project, total, availableCount }, i) => (
            <Reveal key={project.slug} delay={i * 70}>
              <Link href={`/projects/${project.slug}`} className="group block">
                <Media
                  ratio="standard"
                  radius="md"
                  src={project.coverImage.src}
                  alt={project.coverImage.alt}
                  className="transition-transform duration-500 ease-[var(--ease-standard)] group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-h3 group-hover:text-accent transition-colors duration-200">
                      {project.name}
                    </h3>
                    <p className="text-caption text-fg-subtle mt-1 uppercase">{project.location}</p>
                    <p className="text-body-sm text-fg-muted mt-3">
                      {availableCount > 0
                        ? `${availableCount} available of ${total} listed`
                        : `${total} ${total === 1 ? "unit" : "units"} listed`}
                    </p>
                  </div>
                  <ArrowRight
                    aria-hidden
                    className="text-fg-subtle mt-1 size-5 shrink-0 transition-all duration-200 ease-[var(--ease-standard)] group-hover:translate-x-1 group-hover:text-accent"
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
