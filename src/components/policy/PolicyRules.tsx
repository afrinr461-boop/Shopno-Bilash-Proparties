import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { renderRichText } from "@/lib/richText";
import type { PolicyRule } from "@/types/policyRule";

/**
 * One numbered row per rule — "Rule N" auto-derived from list position (see
 * `listPolicyRulesOrdered`), not typed by the admin, so it can never drift
 * out of sync with the actual order. Falls back to an honest "not published
 * yet" state rather than inventing policy language — unlike "Our Story",
 * legal-adjacent copy isn't something to draft on the company's behalf.
 */
export function PolicyRules({ rules }: { rules: PolicyRule[] }) {
  return (
    <Section spacing="lg">
      <Container size="narrow">
        {rules.length > 0 ? (
          <ol className="flex flex-col">
            {rules.map((rule, i) => (
              <Reveal
                key={rule.id}
                as="li"
                delay={Math.min(i * 60, 300)}
                className="border-border flex gap-6 border-b py-8 first:pt-0 last:border-b-0 last:pb-0 sm:gap-8"
              >
                <span
                  aria-hidden
                  className="bg-accent-soft text-accent border-border-strong text-label flex size-10 shrink-0 items-center justify-center rounded-full border font-semibold tabular-nums"
                >
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1.5 pt-1.5">
                  <h3 className="text-h4 text-fg">{rule.title}</h3>
                  <div className="text-body-lg text-fg-muted flex flex-col gap-3">{renderRichText(rule.text)}</div>
                </div>
              </Reveal>
            ))}
          </ol>
        ) : (
          <Reveal>
            <p className="text-body-lg text-fg-muted text-balance">
              This page will list the company&rsquo;s official policies once published. Check back soon, or contact us
              directly with any questions in the meantime.
            </p>
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
