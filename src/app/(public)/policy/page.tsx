import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { PolicyRules } from "@/components/policy/PolicyRules";
import { listPolicyRulesOrdered } from "@/features/policyRules/repository";

export const metadata: Metadata = {
  title: "Company Policy",
  description: "Shopno Bilash Properties' official company policies.",
  alternates: { canonical: "/policy" },
};

export default async function PolicyPage() {
  const rules = await listPolicyRulesOrdered();

  return (
    <>
      <section className="border-border border-b">
        <Container>
          <div className="max-w-2xl py-24 sm:py-32">
            <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
              Legal
            </Reveal>
            <Reveal>
              <h1 className="text-display-l">Company Policy</h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-body-lg text-fg-muted mt-8">
                The rules and commitments Shopno Bilash Properties operates by, as a company — separate from the
                website-specific Privacy, Terms and Cookie policies.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      <PolicyRules rules={rules} />
    </>
  );
}
