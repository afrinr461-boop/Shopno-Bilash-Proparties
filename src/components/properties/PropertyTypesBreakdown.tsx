import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { getPropertyTypes, type PropertyListing } from "@/lib/properties";

/**
 * A numbered editorial breakdown, not a row of icon boxes — every count is
 * computed from the actual listings, never invented to make the section
 * look fuller than the real catalog is.
 */
export function PropertyTypesBreakdown({ listings }: { listings: PropertyListing[] }) {
  const types = getPropertyTypes(listings).map((type) => {
    const inType = listings.filter((l) => l.unitType === type);
    const developmentCount = new Set(inType.map((l) => l.project.slug)).size;
    return { type, count: inType.length, developmentCount };
  });

  if (types.length === 0) return null;

  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-12 uppercase">
          Property Types
        </Reveal>

        <div>
          <Divider />
          {types.map(({ type, count, developmentCount }, i) => (
            <Reveal key={type} delay={i * 60}>
              <Link
                href={`/properties?type=${encodeURIComponent(type)}`}
                className="group flex items-center justify-between gap-6 py-8 transition-[padding] duration-300 ease-[var(--ease-standard)] hover:pl-3"
              >
                <span className="flex items-baseline gap-8">
                  <span className="text-label text-fg-subtle w-10 shrink-0 tabular-nums transition-colors duration-300 group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="text-h3 block transition-colors duration-200 group-hover:text-accent">
                      {type}
                    </span>
                    <span className="text-body-sm text-fg-muted mt-1 block">
                      {count} {count === 1 ? "property" : "properties"} across {developmentCount}{" "}
                      {developmentCount === 1 ? "development" : "developments"}
                    </span>
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="text-fg-subtle size-5 shrink-0 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:translate-x-1 group-hover:text-accent"
                />
              </Link>
              <Divider />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
