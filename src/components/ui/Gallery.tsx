"use client";

import { useCallback, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Lightbox } from "@/components/ui/Lightbox";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/content/shared";

/** Every 5th image gets the large treatment, for an asymmetric rather than uniform grid. */
function isLarge(i: number) {
  return i % 5 === 0;
}

export interface GalleryProps {
  images: ImageAsset[];
  label?: string;
  background?: "bg" | "surface" | "transparent";
}

/**
 * Asymmetric grid (not a uniform thumbnail wall) that opens into a
 * full-screen <Lightbox> — used for both the Project and Unit galleries.
 * Renders nothing if there are no images, rather than an empty section.
 */
export function Gallery({ images, label = "Gallery", background = "transparent" }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const close = useCallback(() => setLightboxIndex(null), []);

  if (images.length === 0) return null;

  return (
    <Section spacing="lg" background={background}>
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-10 uppercase">
          {label}
        </Reveal>

        <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-3 lg:auto-rows-[240px]">
          {images.map((image, i) => (
            <Reveal
              key={image.src + i}
              delay={Math.min(i, 6) * 40}
              className={cn(isLarge(i) && "col-span-2 row-span-2")}
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={`Open image ${i + 1} of ${images.length}: ${image.alt}`}
                className="group block h-full w-full"
              >
                <Media
                  ratio="auto"
                  containerClassName="h-full"
                  src={image.src}
                  alt=""
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="transition-transform duration-500 ease-[var(--ease-standard)] group-hover:scale-105"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </Container>

      <Lightbox images={images} index={lightboxIndex} onClose={close} onNavigate={setLightboxIndex} label={label} />
    </Section>
  );
}
