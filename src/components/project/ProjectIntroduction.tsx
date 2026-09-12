import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { Project } from "@/content/projects";

/**
 * Large statement (the concept, if set — otherwise the short description)
 * on one side, the fuller description on the other. Same asymmetric split
 * language as About's <OurApproach>, applied to this one project instead
 * of the whole company.
 */
export function ProjectIntroduction({ project }: { project: Project }) {
  return (
    <Section spacing="lg">
      <Container>
        <Reveal className="mb-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              { label: project.name },
            ]}
          />
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-20">
          <Reveal>
            <p className="text-display-m max-w-xl text-balance">
              {project.concept ?? project.shortDescription}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-body-lg text-fg-muted">{project.description}</p>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
