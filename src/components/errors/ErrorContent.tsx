"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

/**
 * The shared body of the public route group's `error.tsx` boundary — never
 * a raw stack trace or a blank page. `error` is logged to the console for
 * whoever's debugging locally; nothing about it (message, digest) is shown
 * to the visitor.
 */
export function ErrorContent({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section spacing="lg">
      <Container size="narrow" className="text-center">
        <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
          Something Went Wrong
        </Reveal>
        <Reveal delay={80}>
          <p className="text-display-m text-balance">This page ran into a problem.</p>
        </Reveal>
        <Reveal delay={160}>
          <p className="text-body-lg text-fg-muted mt-6 max-w-md mx-auto">
            Nothing on your end caused this. Try again, or head back to the homepage.
          </p>
        </Reveal>
        <Reveal delay={240} className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button type="button" onClick={reset} className={buttonVariants({ size: "lg" })}>
            Try Again
          </button>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Return Home
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}
