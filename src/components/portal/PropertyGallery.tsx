"use client";

import { useCallback, useRef, useState } from "react";
import { Expand } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export interface PropertyGalleryImage {
  src: string;
  alt: string;
}

/**
 * The property showcase's main visual — one large image at a time with a
 * thumbnail strip beneath, not the public site's asymmetric grid
 * (`components/ui/Gallery.tsx`, built for browsing many photos loosely,
 * not "this is the one property I own"). Swipe comes from a native
 * scroll-snap track (no gesture library) so it works identically with
 * touch, trackpad, or the arrow buttons. Opens into the same shared
 * `<Lightbox>` the public site's galleries use.
 */
export function PropertyGallery({ images }: { images: PropertyGalleryImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }, []);

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  if (images.length === 0) return null;

  return (
    // `<Lightbox>` is deliberately a sibling of `<Reveal>`, never a
    // descendant — `<Reveal>` applies a CSS `transform` for its entrance
    // animation, and any transformed ancestor turns the Lightbox's
    // `position: fixed` into something scoped to that ancestor's box
    // instead of the real viewport (a plain CSS gotcha, not a React one).
    // Same reason `components/ui/Gallery.tsx` keeps its own `<Lightbox>`
    // outside every `<Reveal>` it uses.
    <>
      <Reveal className="flex flex-col gap-3">
        <div className="relative">
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          >
            {images.map((image, i) => (
              <button
                key={image.src + i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={`View ${image.alt || "property photo"} full screen`}
                className="group w-full shrink-0 snap-center"
              >
                <Media
                  ratio="hero"
                  radius="lg"
                  src={image.src}
                  alt={image.alt}
                  sizes="100vw"
                  priority={i === 0}
                  className="transition-transform duration-700 ease-[var(--ease-standard)] group-hover:scale-[1.02]"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setLightboxIndex(activeIndex)}
            aria-label="View full screen"
            className="bg-fg/60 text-white absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption backdrop-blur-sm transition-opacity hover:bg-fg/75"
          >
            <Expand aria-hidden className="size-3.5" />
            View full screen
          </button>

          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden">
              {images.map((image, i) => (
                <span
                  key={image.src + i}
                  aria-hidden
                  className={cn("size-1.5 rounded-full transition-colors", i === activeIndex ? "bg-white" : "bg-white/40")}
                />
              ))}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            {images.map((image, i) => (
              <button
                key={image.src + i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === activeIndex}
                className={cn(
                  "shrink-0 overflow-hidden rounded-md border transition-colors",
                  i === activeIndex ? "border-accent" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Media ratio="square" src={image.src} alt="" containerClassName="size-16" />
              </button>
            ))}
          </div>
        )}
      </Reveal>

      <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} label="Property photos" />
    </>
  );
}
