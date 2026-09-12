"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Lightbox, type LightboxImage } from "@/components/ui/Lightbox";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { GALLERY_CATEGORIES, type GalleryItem } from "@/content/gallery";
import type { Project } from "@/content/projects";

/** Every 5th tile spans 2x2 for an asymmetric rather than uniform grid — same rhythm as <Gallery>, tuned for a longer, filterable collection. */
function isLarge(i: number) {
  return i % 5 === 0;
}

export function GalleryExplorer({ items, projects }: { items: GalleryItem[]; projects: Project[] }) {
  const [category, setCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = useMemo(
    () => ["All", ...GALLERY_CATEGORIES.filter((c) => items.some((i) => i.category === c))],
    [items],
  );
  const filtered = useMemo(
    () => (category === "All" ? items : items.filter((i) => i.category === category)),
    [items, category],
  );

  const lightboxImages: LightboxImage[] = filtered.map((item) => {
    const project = item.projectSlug ? projects.find((p) => p.slug === item.projectSlug) : undefined;
    return {
      src: item.image.src,
      alt: item.image.alt,
      caption: item.caption ?? item.title,
      meta: project ? (
        <Link
          href={`/projects/${project.slug}`}
          className="text-button text-accent inline-flex items-center gap-2"
        >
          {project.name} <ArrowRight aria-hidden className="size-4" />
        </Link>
      ) : undefined,
    };
  });

  if (items.length === 0) {
    return (
      <Section spacing="lg" background="surface">
        <Container size="narrow" className="text-center">
          <p className="text-h2">More photography is coming.</p>
          <p className="text-body text-fg-muted mt-4">
            We&rsquo;re building out our visual archive as each project progresses.
          </p>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="lg" background="surface">
      <Container>
        <div
          role="tablist"
          aria-label="Filter gallery by category"
          className="mb-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-6"
        >
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "text-nav pb-1 transition-colors duration-150",
                category === c ? "text-fg border-fg border-b-2" : "text-fg-subtle hover:text-fg",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-3 lg:auto-rows-[260px] lg:grid-cols-4">
          {filtered.map((item, i) => (
            <Reveal
              key={item.id}
              delay={Math.min(i, 6) * 40}
              className={cn(isLarge(i) && "col-span-2 row-span-2")}
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={item.title ? `Open image: ${item.title}` : `Open image ${i + 1}`}
                className="group block h-full w-full"
              >
                <Media
                  ratio="auto"
                  containerClassName="h-full"
                  src={item.image.src}
                  alt=""
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="transition-transform duration-500 ease-[var(--ease-standard)] group-hover:scale-105"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </Container>

      <Lightbox
        images={lightboxImages}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        label="Gallery"
      />
    </Section>
  );
}
