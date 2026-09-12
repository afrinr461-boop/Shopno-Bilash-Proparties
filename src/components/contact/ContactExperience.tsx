"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { EnquiryForm } from "./EnquiryForm";
import { EnquiryTypeSelector } from "./EnquiryTypeSelector";

export interface EnquiryContext {
  projectName?: string;
  unitName?: string;
  enquiryType?: string;
}

export interface EnquiryProjectOption {
  name: string;
  projectType: string;
}

/**
 * Combines the enquiry-type selector and the smart form into one component
 * since they share state: picking a type both highlights the selector and
 * reveals that type's extra fields (brief §4/§5). Project/Unit context
 * arriving via the URL (from a Project or Unit page's "Enquire" CTA) is
 * shown above the form and submitted as hidden fields, ready for a future
 * CRM to read.
 */
export function ContactExperience({
  context,
  projects,
}: {
  context: EnquiryContext;
  projects: EnquiryProjectOption[];
}) {
  const [selected, setSelected] = useState(context.enquiryType ?? "general");

  return (
    <Section spacing="lg" background="surface">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[2fr_3fr] lg:gap-20">
          <EnquiryTypeSelector selected={selected} onSelect={setSelected} preSelected={Boolean(context.enquiryType)} />
          <div className="lg:sticky lg:top-28 lg:self-start">
            <EnquiryForm type={selected} context={context} projects={projects} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
