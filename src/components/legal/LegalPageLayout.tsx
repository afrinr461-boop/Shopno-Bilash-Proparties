import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { DocumentStack } from "@/components/ui/DocumentStack";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { LegalPage } from "@/content/legal";

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Shared shell for Privacy/Terms/Disclaimer/Cookie Policy — a quiet,
 * readable column rather than a decorated page, since these exist to be
 * read carefully, not to sell anything. The right-hand motif and the "On
 * This Page" jump-list exist to use the extra width a wide viewport
 * leaves next to a single text column, not to decorate for its own sake
 * — every section it lists is a real, working same-page anchor. A future
 * legal-adviser review only ever needs to touch `content/legal.ts`, never
 * this layout.
 */
export function LegalPageLayout({ page }: { page: LegalPage }) {
  const sectionsWithIds = page.sections.map((section) => ({ ...section, id: slugify(section.heading) }));

  return (
    <>
      <section className="border-border relative overflow-hidden border-b">
        <Reveal
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34%] xl:block"
        >
          <DocumentStack className="text-border-strong h-full w-full opacity-70" />
          <div className="from-bg absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
        </Reveal>

        <Container className="relative">
          <div className="max-w-2xl py-24 sm:py-32">
            <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
              {page.eyebrow}
            </Reveal>
            <Reveal>
              <h1 className="text-display-l">{page.title}</h1>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-caption text-fg-subtle mt-4">Last updated: {page.lastUpdated}</p>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-body-lg text-fg-muted mt-8">{page.intro}</p>
            </Reveal>
          </div>
        </Container>
      </section>

      <Section spacing="lg">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_240px]">
            <Reveal className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-label text-fg-subtle mb-4 uppercase">On This Page</p>
                <ul className="border-border flex flex-col gap-1 border-l">
                  {sectionsWithIds.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="text-body-sm text-fg-muted hover:text-fg hover:border-fg -ml-px block border-l border-transparent py-1.5 pl-4 transition-colors"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <div className="max-w-2xl">
              {sectionsWithIds.map((section, i) => (
                <Reveal
                  key={section.heading}
                  delay={Math.min(i * 40, 240)}
                  id={section.id}
                  className="scroll-mt-28 mb-12 last:mb-0"
                >
                  <h2 className="text-h3">{section.heading}</h2>
                  <div className="mt-3 flex flex-col gap-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-body text-fg-muted">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.list && (
                    <ul className="mt-3 flex flex-col gap-2">
                      {section.list.map((item) => (
                        <li key={item} className="text-body text-fg-muted flex gap-3">
                          <span aria-hidden className="text-fg-subtle">
                            —
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              ))}

              <Reveal delay={280} className="border-border mt-16 border-t pt-8">
                <p className="text-body-sm text-fg-subtle">
                  Questions about this page can be sent through{" "}
                  <Link href="/contact" className="text-accent hover:text-accent-strong underline underline-offset-4">
                    Enquire
                  </Link>
                  .
                </p>
              </Reveal>
            </div>

            <Reveal className="hidden xl:block">
              <div className="sticky top-28">
                <DocumentStack className="text-border-strong h-auto w-full opacity-70" />
                <p className="text-body-sm text-fg-subtle border-border mt-6 border-t pt-4">
                  Every policy here is written to be reviewed and refined by the company&rsquo;s legal
                  adviser — nothing on this page is a substitute for that.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
