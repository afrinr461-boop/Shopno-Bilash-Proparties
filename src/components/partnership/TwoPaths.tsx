import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { Reveal } from "@/components/ui/Reveal";
import { twoPaths } from "@/content/partnership";

/**
 * A genuine light/dark split, edge to edge — not two identical cards. The
 * contrast itself communicates "these are two different paths" before the
 * visitor reads a word.
 */
export function TwoPaths() {
  return (
    <section className="grid lg:grid-cols-2">
      <Reveal className="bg-surface border-b-2 border-border-strong">
        <Link
          href={`#${twoPaths.landowner.anchor}`}
          className="group flex h-full flex-col justify-between gap-10 px-6 py-20 sm:px-12 sm:py-28 lg:px-16"
        >
          <p className="text-label text-fg-subtle uppercase">{twoPaths.landowner.label}</p>
          <div>
            <h2 className="text-display-m max-w-md text-balance">{twoPaths.landowner.title}</h2>
            <p className="text-body text-fg-muted mt-6 max-w-md">{twoPaths.landowner.description}</p>
          </div>
          <span className="text-button text-accent inline-flex items-center gap-2">
            Explore for Landowners
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:translate-x-1"
            />
          </span>
        </Link>
      </Reveal>

      <Reveal
        delay={100}
        data-header-tone="dark"
        className="bg-fg relative overflow-hidden border-b-2 border-white/15 text-white"
      >
        <ArchitecturalMotif
          fit="cover"
          className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-[72%] w-full -translate-y-1/2 text-white/10 sm:block"
        />
        <Link
          href={`#${twoPaths.investor.anchor}`}
          className="group relative flex h-full flex-col justify-between gap-10 px-6 py-20 sm:px-12 sm:py-28 lg:px-16"
        >
          <p className="text-label uppercase text-white/60">{twoPaths.investor.label}</p>
          <div>
            <h2 className="text-display-m max-w-md text-balance">{twoPaths.investor.title}</h2>
            <p className="text-body mt-6 max-w-md text-white/75">{twoPaths.investor.description}</p>
          </div>
          <span className="text-button inline-flex items-center gap-2 text-white">
            Explore for Investors
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:translate-x-1"
            />
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
