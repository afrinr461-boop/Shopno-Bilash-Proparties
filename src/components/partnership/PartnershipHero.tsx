"use client";

import Link from "next/link";
import { usePageHeaderVariant } from "@/components/navigation/HeaderVariantContext";
import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { hero } from "@/content/partnership";

/** Same dark cinematic family and full-viewport treatment as the Home Hero / About Intro — fills the first screen completely rather than leaving a gap before the next section. */
export function PartnershipHero() {
  usePageHeaderVariant("overlay");

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[linear-gradient(160deg,var(--color-accent-strong),var(--color-fg)_120%)] pt-32 pb-20 sm:pb-24 md:justify-center lg:justify-end">
      <ArchitecturalMotif
        fit="cover"
        className="pointer-events-none absolute inset-0 hidden h-full w-full text-white/10 sm:block"
      />

      <Container className="relative">
        <p className="hero-in text-label mb-4 text-white/60 uppercase sm:mb-6" style={{ animationDelay: "0ms" }}>
          {hero.eyebrow}
        </p>
        <h1
          className="hero-in text-display-xl max-w-3xl text-balance text-white"
          style={{ animationDelay: "80ms" }}
        >
          {hero.headline}
        </h1>
        <p
          className="hero-in text-body-lg mt-6 max-w-xl text-white/75"
          style={{ animationDelay: "220ms" }}
        >
          {hero.supporting}
        </p>

        <div
          className="hero-in mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          style={{ animationDelay: "360ms" }}
        >
          <Link href="#enquiry" className={buttonVariants({ size: "lg" })}>
            Start a Partnership Conversation
          </Link>
          <Link
            href="#process"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/35 text-white hover:border-white/70 hover:bg-white/10",
            )}
          >
            See How It Works
          </Link>
        </div>
      </Container>
    </section>
  );
}
