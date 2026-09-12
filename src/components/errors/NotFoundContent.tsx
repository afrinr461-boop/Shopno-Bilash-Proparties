import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { LostPath } from "@/components/ui/LostPath";
import { Reveal } from "@/components/ui/Reveal";

const DESTINATIONS = [
  { title: "Explore Projects", description: "Every development we're currently building.", href: "/projects" },
  { title: "View Properties", description: "Available units, ready to reserve or buy.", href: "/properties" },
  { title: "Return Home", description: "Back to the start.", href: "/" },
];

/**
 * The shared body of both `not-found.tsx` files (root, for a genuinely
 * unmatched URL, and the `(public)` group's, for an internal `notFound()`
 * call on an invalid project/unit/article slug) — one editorial moment
 * instead of a bare "404 Page Not Found," reusing the same
 * link-row language as the homepage's <NextExploration>.
 */
export function NotFoundContent() {
  return (
    <section className="relative overflow-hidden">
      <Container className="relative">
        <div className="relative">
          <Reveal
            as="div"
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] items-center lg:flex"
          >
            <LostPath className="text-border-strong h-auto w-full opacity-70" />
            <div className="from-bg absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
          </Reveal>

          <div className="max-w-2xl py-24 sm:py-32 lg:max-w-xl lg:py-40">
            <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
              404
            </Reveal>
            <h1 className="flex flex-col">
              <Reveal as="span" className="text-display-xl">
                The space you&rsquo;re looking for
              </Reveal>
              <Reveal as="span" delay={100} className="text-display-xl text-fg-subtle">
                doesn&rsquo;t exist.
              </Reveal>
            </h1>
            <Reveal delay={220}>
              <p className="text-body-lg text-fg-muted mt-8 max-w-md">
                The page may have moved, or the link might be outdated. Here&rsquo;s where you can go instead.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="pb-16 sm:pb-24 lg:pb-28">
          <Reveal>
            <Divider />
          </Reveal>
          {DESTINATIONS.map((item, i) => (
            <Reveal key={item.href} delay={280 + i * 60}>
              <Link
                href={item.href}
                className="group flex items-center justify-between gap-6 py-7 transition-[padding] duration-300 ease-[var(--ease-standard)] hover:pl-3"
              >
                <span>
                  <span className="text-h2 block transition-colors duration-200 group-hover:text-accent">
                    {item.title}
                  </span>
                  <span className="text-body text-fg-muted mt-1 block">{item.description}</span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="text-fg-subtle size-6 shrink-0 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
                />
              </Link>
              <Divider />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
