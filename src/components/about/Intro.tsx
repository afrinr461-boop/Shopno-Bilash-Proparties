"use client";

import Link from "next/link";
import { usePageHeaderVariant } from "@/components/navigation/HeaderVariantContext";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { intro } from "@/content/about";

const CTA_PRIMARY = { label: "Explore Projects", href: "/projects" };
const CTA_SECONDARY = { label: "Contact Us", href: "/contact" };

/**
 * Opening statement for the About page — same dark, cinematic visual
 * family and full-viewport treatment as the homepage Hero (gradient,
 * skyline line motif, entrance sequence, scroll cue), so this reads as an
 * equally complete moment rather than a stripped-down copy of it.
 */
export function Intro() {
  usePageHeaderVariant("overlay");

  return (
    <section
      data-header-tone="dark"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[linear-gradient(160deg,var(--color-accent-strong),var(--color-fg)_120%)]"
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-[0.08] sm:block"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {[10, 24, 40, 58, 74, 90].map((x, i) => (
          <rect key={x} x={x} y={100 - (18 + (i % 2) * 16)} width="2" height={18 + (i % 2) * 16} fill="white" />
        ))}
      </svg>

      <Container className="relative flex flex-1 flex-col justify-end pt-32 pb-16 sm:pb-20 md:justify-center lg:justify-end lg:pb-24">
        <p
          className="hero-in text-label mb-4 text-white/60 uppercase sm:mb-6"
          style={{ animationDelay: "0ms" }}
        >
          {intro.eyebrow}
        </p>

        <h1
          className="hero-in text-display-l max-w-2xl text-balance text-white"
          style={{ animationDelay: "80ms" }}
        >
          {intro.statement}
        </h1>

        <p
          className="hero-in text-body-lg mt-6 max-w-md text-white/75"
          style={{ animationDelay: "220ms" }}
        >
          {intro.supporting}
        </p>

        <div
          className="hero-in mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center"
          style={{ animationDelay: "360ms" }}
        >
          <Link href={CTA_PRIMARY.href} className={buttonVariants({ size: "lg" })}>
            {CTA_PRIMARY.label}
          </Link>
          <Link
            href={CTA_SECONDARY.href}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/35 text-white hover:border-white/70 hover:bg-white/10",
            )}
          >
            {CTA_SECONDARY.label}
          </Link>
        </div>
      </Container>

      <div
        aria-hidden
        className="hero-in relative flex justify-center pb-8"
        style={{ animationDelay: "500ms" }}
      >
        <span className="relative h-12 w-px overflow-hidden bg-white/25">
          <span className="scroll-cue-dot absolute inset-x-0 top-0 h-3 bg-white" />
        </span>
      </div>
    </section>
  );
}
