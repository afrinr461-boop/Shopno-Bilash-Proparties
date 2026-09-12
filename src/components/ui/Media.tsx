"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const mediaVariants = cva("relative w-full overflow-hidden bg-surface", {
  variants: {
    ratio: {
      hero: "aspect-[16/9]",
      wide: "aspect-[21/9]",
      standard: "aspect-[4/3]",
      square: "aspect-square",
      portrait: "aspect-[3/4]",
      auto: "",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
    },
  },
  defaultVariants: {
    ratio: "standard",
    radius: "none",
  },
});

export interface MediaProps
  extends Omit<ImageProps, "className">,
    VariantProps<typeof mediaVariants> {
  className?: string;
  containerClassName?: string;
  /** Bottom gradient scrim so overlaid captions/text stay legible on any photo. */
  overlay?: boolean;
  caption?: React.ReactNode;
}

/**
 * The one place image treatment (aspect ratio, radius, caption scrim) is
 * decided — every project/property/gallery image should go through this
 * rather than a raw <Image>, so photography reads consistently site-wide.
 * A client component (not just for the fallback below): `next/image`'s own
 * loading behavior already ships client JS regardless, and `onError` can
 * only be wired from a client boundary.
 */
export function Media({
  ratio,
  radius,
  overlay = false,
  caption,
  containerClassName,
  className,
  alt,
  fill = true,
  sizes = "100vw",
  onError,
  ...props
}: MediaProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn(mediaVariants({ ratio, radius }), containerClassName)}>
      {failed ? (
        <div className="text-fg-subtle absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <ImageOff aria-hidden className="size-6" />
          <span className="text-caption">Image unavailable</span>
        </div>
      ) : (
        <Image
          alt={alt}
          fill={fill}
          sizes={sizes}
          className={cn("object-cover", className)}
          onError={(e) => {
            setFailed(true);
            onError?.(e);
          }}
          {...props}
        />
      )}
      {overlay && !failed && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent"
        />
      )}
      {caption && !failed && (
        <div className="absolute inset-x-0 bottom-0 p-4 text-body-sm text-white">
          {caption}
        </div>
      )}
    </div>
  );
}
