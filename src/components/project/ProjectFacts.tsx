import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { PROJECT_STATUS_LABEL, type Project } from "@/content/projects";

/**
 * A spec-sheet, not a dashboard: only fields that actually exist on this
 * project render, each as a large value with a small label — no icons, no
 * cards, no invented placeholders for missing fields.
 */
export function ProjectFacts({ project }: { project: Project }) {
  const facts: { label: string; value: string }[] = [
    { label: "Location", value: project.location },
    { label: "Type", value: project.projectType },
    { label: "Status", value: PROJECT_STATUS_LABEL[project.status] },
    project.buildingType ? { label: "Building", value: project.buildingType } : null,
    project.floors ? { label: "Floors", value: String(project.floors) } : null,
    project.completionYear ? { label: "Completion", value: String(project.completionYear) } : null,
    project.totalUnits ? { label: "Total Units", value: String(project.totalUnits) } : null,
    project.area ? { label: "Area", value: project.area } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

  return (
    <Section spacing="md" background="surface">
      <Container>
        <Divider />
        <div className="flex flex-wrap">
          {facts.map((fact, i) => (
            <Reveal
              key={fact.label}
              delay={i * 40}
              className="border-border w-1/2 border-r py-8 pr-6 sm:w-1/3 lg:w-auto lg:flex-1 lg:border-r lg:last:border-r-0"
            >
              <p className="text-label text-fg-subtle mb-2 uppercase">{fact.label}</p>
              <p className="text-h3">{fact.value}</p>
            </Reveal>
          ))}
        </div>
        <Divider />
      </Container>
    </Section>
  );
}
