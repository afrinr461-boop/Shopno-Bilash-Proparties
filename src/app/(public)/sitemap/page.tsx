import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { projectContentRepository } from "@/features/projectContent/repository";
import { newsArticles } from "@/content/news";
import type { Project } from "@/content/projects";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every page on the Shopno Bilash Properties website, organized.",
  alternates: { canonical: "/sitemap" },
};

interface LinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

/** Every href here is a route this project actually builds — checked against config/navigation.ts and src/app/(public) directly, never guessed. */
function buildGroups(projects: Project[]): LinkGroup[] {
  return [
    {
      title: "Main",
      links: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Projects", href: "/projects" },
        { label: "Properties", href: "/properties" },
        { label: "Services", href: "/services" },
        { label: "Construction", href: "/construction" },
        { label: "Landowners & JV", href: "/landowners" },
        { label: "Investment", href: "/landowners#investment" },
        { label: "Gallery", href: "/gallery" },
        { label: "News", href: "/news" },
        { label: "Enquire", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Company Policy", href: "/policy" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Property Disclaimer", href: "/disclaimer" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
    {
      title: "Projects",
      links: projects.map((p) => ({ label: p.name, href: `/projects/${p.slug}` })),
    },
    {
      title: "News",
      links: newsArticles.map((a) => ({ label: a.title, href: `/news/${a.slug}` })),
    },
  ].filter((group) => group.links.length > 0);
}

export default async function SitemapPage() {
  const projects = await projectContentRepository.list();
  const groups = buildGroups(projects);

  return (
    <Section spacing="lg">
      <Container>
        <div className="max-w-2xl">
          <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
            Sitemap
          </Reveal>
          <Reveal>
            <h1 className="text-display-l">Every page, in one place.</h1>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group, i) => (
            <Reveal key={group.title} delay={i * 60}>
              <p className="text-label text-fg-subtle mb-4 uppercase">{group.title}</p>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-fg-muted hover:text-fg transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
