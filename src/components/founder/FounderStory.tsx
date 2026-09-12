import { Container } from "@/components/ui/Container";
import { CornerstoneMotif } from "@/components/ui/CornerstoneMotif";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { FounderProfile } from "@/types/founderProfile";

export interface FounderStoryProps {
  profile: FounderProfile;
}

/**
 * The founder's story as three distinct editorial beats — Journey,
 * Philosophy, Vision — rather than one long paragraph in a card. Each is
 * its own `<Section>` with a different rhythm (image-paired / highlighted
 * panel / centered close) so the page doesn't repeat the same layout
 * three times in a row, and each only renders when the admin has actually
 * written it — a section with nothing entered is skipped, not padded
 * with invented copy.
 */
export function FounderStory({ profile }: FounderStoryProps) {
  const supportingImage = profile.gallery[0];
  const hasVision = Boolean(profile.vision || profile.mission);

  return (
    <>
      {profile.bio && (
        <Section spacing="lg">
          <Container>
            <div className="grid items-start gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
              <div>
                <Reveal as="p" className="text-label text-premium mb-8 uppercase">
                  The Journey
                </Reveal>
                <Reveal>
                  <p className="font-sans text-fg max-w-2xl text-[1.2rem] leading-[1.75] font-normal whitespace-pre-line">
                    {profile.bio}
                  </p>
                </Reveal>
              </div>

              <Reveal delay={120} className="hidden lg:block">
                {supportingImage ? (
                  <Media
                    ratio="portrait"
                    radius="lg"
                    src={supportingImage.src}
                    alt={supportingImage.caption ?? profile.name}
                    caption={supportingImage.caption}
                    sizes="(min-width: 1024px) 32vw, 90vw"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-5">
                    <CornerstoneMotif className="text-border-strong h-auto w-full max-w-[220px]" />
                    <p className="text-caption text-fg-subtle text-center uppercase">Est. — Where It Began</p>

                    <div className="border-border mt-4 flex w-full flex-col gap-3 rounded-lg border p-6">
                      <span aria-hidden className="bg-premium h-px w-8" />
                      <p className="text-caption text-fg-subtle uppercase">A Note</p>
                      <p className="text-body-sm text-fg-muted">
                        A cornerstone doesn&rsquo;t just mark a beginning — it carries everything built on top of
                        it. Every decision made since traces back to the same foundation: build it right, or
                        don&rsquo;t build it at all.
                      </p>
                    </div>
                  </div>
                )}
              </Reveal>
            </div>
          </Container>
        </Section>
      )}

      {profile.philosophy && (
        <Section spacing="lg" background="surface">
          <Container size="narrow">
            <Reveal as="p" className="text-label text-premium mb-8 uppercase">
              The Philosophy
            </Reveal>
            <Reveal delay={80}>
              <p className="border-premium text-h1 text-fg border-l-2 pl-8 text-balance">{profile.philosophy}</p>
            </Reveal>
          </Container>
        </Section>
      )}

      {hasVision && (
        <Section spacing="lg">
          <Container size="narrow" className="text-center">
            <Reveal as="p" className="text-label text-premium mb-8 uppercase">
              The Vision
            </Reveal>
            {profile.vision && (
              <Reveal delay={80}>
                <p className="text-display-m text-fg text-balance">{profile.vision}</p>
              </Reveal>
            )}
            {profile.mission && (
              <Reveal delay={160}>
                <p className="text-body-lg text-fg-muted mt-6">{profile.mission}</p>
              </Reveal>
            )}
          </Container>
        </Section>
      )}
    </>
  );
}
