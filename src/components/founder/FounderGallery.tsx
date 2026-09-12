"use client";

import { useState } from "react";
import { Expand } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Lightbox } from "@/components/ui/Lightbox";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { FounderProfile } from "@/types/founderProfile";

export interface FounderGalleryProps {
  profile: FounderProfile;
}

/**
 * Additional context images — at a project, on site, with the team. The
 * first gallery photo already appears as `FounderStory`'s supporting
 * image, so this shows the rest, and is skipped entirely when there's
 * nothing left to show (never padded with invented photography). Opens
 * into the same shared `<Lightbox>` the public site's other galleries use
 * for a full-screen view.
 */
export function FounderGallery({ profile }: FounderGalleryProps) {
  const images = profile.gallery.slice(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  if (images.length === 0) return null;

  return (
    // `<Lightbox>` stays a sibling of `<Reveal>`, never a descendant — see
    // `PropertyGallery`'s own note on why a transformed ancestor breaks its
    // `position: fixed`.
    <>
      <Section spacing="lg">
        <Container>
          <Reveal as="p" className="text-label text-premium mb-8 uppercase">
            In The Field
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2">
            {images.map((image, i) => (
              <Reveal key={image.src} delay={i * 80}>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`View ${image.caption || "founder photo"} full screen`}
                  className="group relative block w-full"
                >
                  <Media
                    ratio="standard"
                    radius="lg"
                    src={image.src}
                    alt={image.caption ?? profile.name}
                    caption={image.caption}
                    sizes="(min-width: 640px) 48vw, 90vw"
                    className="transition-transform duration-700 ease-[var(--ease-standard)] group-hover:scale-105"
                  />
                  <span className="bg-fg/60 text-white pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <Expand aria-hidden className="size-3.5" />
                    View
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Lightbox
        images={images.map((img) => ({ src: img.src, alt: img.caption ?? profile.name, caption: img.caption }))}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        label="Founder photos"
      />
    </>
  );
}
