"use client";

import Link from "next/link";
import { usePageHeaderVariant } from "@/components/navigation/HeaderVariantContext";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const CTA_PRIMARY = { label: "Explore Projects", href: "/projects" };
const CTA_SECONDARY = { label: "About Us", href: "/about" };

/**
 * First screen of the homepage. Puts the header into transparent "overlay"
 * mode for as long as this component is mounted (see HeaderVariantContext)
 * so the nav reads light-on-dark here and solidifies once the visitor
 * scrolls past it — no separate/disconnected header for this page.
 */
export function Hero() {
  usePageHeaderVariant("overlay");

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[linear-gradient(160deg,var(--color-accent-strong),var(--color-fg)_120%)]">
      {/*
        Placeholder for hero photography. No real project imagery exists
        yet — this abstract skyline-suggestive line motif stands in for it
        so the composition isn't built around a generic stock photo. Swap
        for <Media ratio="hero" overlay src="..." /> (src/components/ui)
        once real photography is available; the rest of this section
        doesn't need to change.
      */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-[0.08] sm:block"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {[8, 18, 28, 40, 52, 64, 76, 88].map((x, i) => (
          <rect
            key={x}
            x={x}
            y={100 - (20 + (i % 3) * 14)}
            width="2.2"
            height={20 + (i % 3) * 14}
            fill="white"
          />
        ))}
      </svg>

      <Container className="relative flex flex-1 flex-col justify-end pt-32 pb-16 sm:pb-20 md:justify-center lg:justify-end lg:pb-24">
        <p
          className="hero-in text-label mb-4 text-white/60 uppercase sm:mb-6"
          style={{ animationDelay: "0ms" }}
        >
          Real Estate Development
        </p>

        <h1 className="max-w-3xl">
          <span
            className="hero-in text-display-xl block text-white"
            style={{ animationDelay: "80ms" }}
          >
            We shape land.
          </span>
          <span
            className="hero-in text-display-xl block text-white"
            style={{ animationDelay: "200ms" }}
          >
            We keep promises.
          </span>
        </h1>

        <p
          className="hero-in text-body-lg mt-6 max-w-md text-white/75 sm:mt-8"
          style={{ animationDelay: "360ms" }}
        >
          Shopno Bilash Properties develops residential projects, partners
          with landowners, and builds every home with the same care — from
          first agreement to final handover.
        </p>

        <div
          className="hero-in mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center"
          style={{ animationDelay: "480ms" }}
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
        style={{ animationDelay: "620ms" }}
      >
        <span className="relative h-12 w-px overflow-hidden bg-white/25">
          <span className="scroll-cue-dot absolute inset-x-0 top-0 h-3 bg-white" />
        </span>
      </div>
    </section>
  );
}
