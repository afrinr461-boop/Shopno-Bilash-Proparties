"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { enquiry } from "@/content/partnership";

const PARTNERSHIP_TYPES = [
  { value: "landowner", label: "Landowner / Property Owner" },
  { value: "investor", label: "Investor / Capital Partner" },
  { value: "development-partner", label: "Development Partner" },
  { value: "other", label: "Other" },
];

type Errors = Partial<Record<"name" | "email" | "partnershipType" | "message", string>>;

/**
 * A real, working form (client-side validation + a local confirmation
 * state) — but nothing is actually transmitted anywhere yet, since no
 * CRM/backend exists. A future Admin/CRM integration replaces the submit
 * handler; the UI and interaction structure are ready for it.
 */
export function PartnershipEnquiry() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const partnershipType = String(form.get("partnershipType") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    const nextErrors: Errors = {};
    if (!name) nextErrors.name = "Please enter your name.";
    if (!email) nextErrors.email = "Please enter your email.";
    if (!partnershipType) nextErrors.partnershipType = "Please select an option.";
    if (!message) nextErrors.message = "Please add a short message.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSubmitted(true);
  }

  return (
    <Section id="enquiry" spacing="lg" background="surface">
      <Container size="narrow">
        <Reveal as="p" className="text-label text-fg-subtle mb-4 uppercase">
          {enquiry.eyebrow}
        </Reveal>
        <Reveal delay={60}>
          <p className="text-display-m text-balance">{enquiry.headline}</p>
        </Reveal>
        <Reveal delay={120}>
          <p className="text-body-lg text-fg-muted mt-6 max-w-xl">{enquiry.supporting}</p>
        </Reveal>

        <Reveal delay={200} className="mt-12">
          {submitted ? (
            <div className="border-border-strong bg-surface-raised flex items-start gap-4 rounded-md border p-6">
              <span className="bg-accent-soft text-accent flex size-9 shrink-0 items-center justify-center rounded-full">
                <Check aria-hidden className="size-5" />
              </span>
              <div>
                <p className="text-h4">Thank you.</p>
                <p className="text-body text-fg-muted mt-2">
                  We&rsquo;ve received your message and our team will be in touch directly.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Input name="name" label="Full Name" error={errors.name} autoComplete="name" />
                <Input name="email" type="email" label="Email" error={errors.email} autoComplete="email" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Input name="phone" type="tel" label="Phone (optional)" autoComplete="tel" />
                <Select
                  name="partnershipType"
                  label="I'm interested in"
                  placeholder="Select one"
                  error={errors.partnershipType}
                  options={PARTNERSHIP_TYPES}
                  defaultValue=""
                />
              </div>
              <Textarea
                name="propertyInfo"
                label="Property or Project Information (optional)"
                placeholder="Location, size, or any relevant project details"
                rows={3}
              />
              <Textarea name="message" label="Message" error={errors.message} rows={4} />
              <Button type="submit" size="lg" className="self-start">
                Send Enquiry
              </Button>
            </form>
          )}
        </Reveal>
      </Container>
    </Section>
  );
}
