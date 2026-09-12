import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertiesByDevelopment } from "@/components/properties/PropertiesByDevelopment";
import { PropertiesEmptyState } from "@/components/properties/PropertiesEmptyState";
import { PropertiesEnquiryCTA } from "@/components/properties/PropertiesEnquiryCTA";
import { PropertiesFeatured } from "@/components/properties/PropertiesFeatured";
import { PropertiesHero } from "@/components/properties/PropertiesHero";
import { PropertyResults } from "@/components/properties/PropertyResults";
import { PropertyTypesBreakdown } from "@/components/properties/PropertyTypesBreakdown";
import { getPropertyTypes, getProjectsWithListings } from "@/lib/properties";
import { getPropertyListingsAsync } from "@/lib/propertiesAsync";

export const metadata: Metadata = {
  title: "Properties",
  description:
    "Every individually available property across our developments — apartments, commercial units and serviced plots, browsable on their own terms.",
  alternates: { canonical: "/properties" },
};

/** Reads the Website CMS's Properties data (`getPropertyListingsAsync`), not the static files directly — see `lib/properties.ts`'s doc comment. */
export default async function PropertiesPage() {
  const listings = await getPropertyListingsAsync();
  const availableCount = listings.filter((l) => l.status === "available").length;

  return (
    <>
      <PropertiesHero
        availableCount={availableCount}
        developmentCount={getProjectsWithListings(listings).length}
        typeCount={getPropertyTypes(listings).length}
      />

      {listings.length === 0 ? (
        <PropertiesEmptyState />
      ) : (
        <>
          <PropertiesFeatured listings={listings} />

          <Suspense fallback={null}>
            <PropertyResults listings={listings} />
          </Suspense>

          <PropertyTypesBreakdown listings={listings} />
          <PropertiesEnquiryCTA />
          <PropertiesByDevelopment listings={listings} />
        </>
      )}
    </>
  );
}
