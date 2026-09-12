import { ProjectCard } from "@/components/project/ProjectCard";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { featuredProject } from "@/content/home";
import { findProjectContentBySlug } from "@/features/projectContent/repository";

/**
 * One concrete example under the Property Development chapter — the same
 * project the homepage spotlights, looked up from the real `projects` data
 * (not the homepage's lean teaser shape) so its actual status/facts show.
 * Omits itself entirely if no project is currently featured, rather than
 * inventing one.
 */
export async function ServicesRelatedProject() {
  const slug = featuredProject?.href.split("/").pop();
  const project = slug ? await findProjectContentBySlug(slug) : null;
  if (!project) return null;

  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-10 uppercase">
          A Development in Progress
        </Reveal>
        <Reveal delay={80}>
          <ProjectCard project={project} variant="featured" />
        </Reveal>
      </Container>
    </Section>
  );
}
