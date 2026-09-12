"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/content/shared";

export interface LightboxImage extends ImageAsset {
  /** Optional caption/title shown under the image — e.g. gallery item titles. */
  caption?: string;
  /** Optional extra content under the caption — e.g. a "View Project" link. */
  meta?: ReactNode;
}

export interface LightboxProps {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  label?: string;
}

/**
 * Full-screen image viewer — arrow-key and Escape navigable, `inert` while
 * closed (same pattern as <MobileNav>/<ProjectFilters>'s sheet), focus
 * moves to the close button on open. Used by <Gallery> and directly by
 * single-image viewers (e.g. a floor plan) that don't want the grid, and
 * by the Gallery page for its richer per-image caption/project link.
 */
export function Lightbox({ images, index, onClose, onNavigate, label = "Image viewer" }: LightboxProps) {
  const open = index !== null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(((index as number) + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate(((index as number) - 1 + images.length) % images.length);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, index, images.length, onClose, onNavigate]);

  const current = open ? images[index] : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-hidden={!open}
      inert={!open || undefined}
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-4 transition-opacity duration-300 ease-[var(--ease-standard)]",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close viewer"
        className="absolute top-6 right-6 flex size-11 items-center justify-center text-white/80 hover:text-white"
      >
        <X aria-hidden className="size-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onNavigate(((index as number) - 1 + images.length) % images.length)}
            aria-label="Previous image"
            className="absolute left-2 flex size-12 items-center justify-center text-white/70 hover:text-white sm:left-6"
          >
            <ChevronLeft aria-hidden className="size-7" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate(((index as number) + 1) % images.length)}
            aria-label="Next image"
            className="absolute right-2 flex size-12 items-center justify-center text-white/70 hover:text-white sm:right-6"
          >
            <ChevronRight aria-hidden className="size-7" />
          </button>
        </>
      )}

      {current && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current.src}
          alt={current.alt}
          className="max-h-[75svh] max-w-[90vw] object-contain"
        />
      )}

      {current && (current.caption || current.meta) && (
        <div className="mt-5 max-w-md text-center">
          {current.caption && <p className="text-body text-white">{current.caption}</p>}
          {current.meta && <div className="mt-2">{current.meta}</div>}
        </div>
      )}

      {open && images.length > 1 && (
        <p className="text-caption mt-4 text-white/60 tabular-nums">
          {index + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
