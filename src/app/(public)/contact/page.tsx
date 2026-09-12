import type { Metadata } from "next";
import { ContactClosing } from "@/components/contact/ContactClosing";
import { ContactExperience } from "@/components/contact/ContactExperience";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactInfoSection } from "@/components/contact/ContactInfoSection";
import { projectContentRepository } from "@/features/projectContent/repository";

export const metadata: Metadata = {
  title: "Enquire",
  description:
    "Start a conversation with Shopno Bilash Properties — about a property, a project, construction, a landowner partnership, or an investment opportunity.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Enquire | Shopno Bilash Properties",
    description:
      "Start a conversation with Shopno Bilash Properties — about a property, a project, construction, a landowner partnership, or an investment opportunity.",
    type: "website",
  },
};

interface PageProps {
  searchParams: Promise<{ project?: string; unit?: string; type?: string }>;
}

export default async function ContactPage({ searchParams }: PageProps) {
  const [params, projects] = await Promise.all([searchParams, projectContentRepository.list()]);

  return (
    <>
      <ContactHero />
      <ContactExperience
        context={{
          projectName: params.project,
          unitName: params.unit,
          enquiryType: params.type,
        }}
        projects={projects.map((p) => ({ name: p.name, projectType: p.projectType }))}
      />
      <ContactInfoSection />
      <ContactClosing />
    </>
  );
}
