import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
  /** Kept for call-site compatibility — the image logo carries its own contrast, so no tone-specific styling is applied. */
  tone?: "default" | "inverted";
  className?: string;
}

// Intrinsic size of public/logo.webp — kept explicit so next/image never
// has to guess an aspect ratio (and never causes layout shift).
const LOGO_WIDTH = 1477;
const LOGO_HEIGHT = 1065;

/** Always links home — the site's one logo asset, full color (it already carries its own contrast), used at whatever height each call site sizes it to. */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Shopno Bilash Properties — home"
      className={cn("inline-flex h-12 shrink-0 items-center transition-opacity duration-150 hover:opacity-85 sm:h-16", className)}
    >
      <Image
        src="/logo.webp"
        alt="Shopno Bilash Properties"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
        className="h-full w-auto object-contain"
      />
    </Link>
  );
}
