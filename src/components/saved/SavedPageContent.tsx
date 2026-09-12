"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { WishlistMotif } from "@/components/ui/WishlistMotif";
import { useSavedIds } from "@/hooks/useSavedProperties";
import type { PropertyListing } from "@/lib/properties";
import { SavedEmptyState } from "./SavedEmptyState";

export interface SavedPageContentProps {
  listings: PropertyListing[];
}

/**
 * The saved-id list only exists in this browser's local storage
 * (`lib/savedProperties.ts`), so this stays a Client Component — but the
 * listings themselves now come from the parent Server Component
 * (`propertiesAsync.getPropertyListingsAsync`, the live CMS-backed data,
 * same as `/properties`), not the old static `lib/properties.ts` import.
 * A saved id whose unit was since removed from the catalog is silently
 * dropped rather than shown broken.
 */
export function SavedPageContent({ listings: allListings }: SavedPageContentProps) {
  const savedIds = useSavedIds();
  const listings = allListings.filter((l) => savedIds.includes(l.id));

  return (
    <>
      <Section spacing="lg" className="border-border border-b">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
                Saved
              </Reveal>
              <Reveal>
                <h1 className="text-display-l">Your saved properties.</h1>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-body-lg text-fg-muted mt-6 max-w-md">
                  Kept on this device only — nothing here is shared or sent anywhere.
                </p>
              </Reveal>
            </div>
            {listings.length > 0 ? (
              <Reveal delay={160}>
                <Link
                  href="/contact?type=property"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Enquire About Saved Properties
                </Link>
              </Reveal>
            ) : (
              <Reveal delay={160} className="hidden lg:flex lg:flex-col lg:items-center lg:gap-4">
                <WishlistMotif className="text-border-strong h-40 w-auto" />
                <p className="text-caption text-fg-subtle uppercase">Saved, Just For You</p>
              </Reveal>
            )}
          </div>
        </Container>
      </Section>

      {listings.length === 0 ? (
        <SavedEmptyState />
      ) : (
        <Section spacing="lg">
          <Container>
            <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing, i) => (
                <Reveal key={listing.id} delay={i * 60}>
                  <PropertyCard listing={listing} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
