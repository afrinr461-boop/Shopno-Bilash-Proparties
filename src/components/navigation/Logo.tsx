import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  tone?: "default" | "inverted";
  className?: string;
}

/** Wordmark only — no mark/icon asset exists yet. Always links home. */
export function Logo({ tone = "default", className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Shopno Bilash Properties — home"
      className={cn(
        "text-h4 tracking-tight transition-colors duration-150",
        tone === "inverted" ? "text-white hover:text-white/85" : "text-fg hover:text-fg/85",
        className,
      )}
    >
      Shopno Bilash
    </Link>
  );
}
