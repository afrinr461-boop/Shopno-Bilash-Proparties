import type { Metadata } from "next";
import { SavedPageContent } from "@/components/saved/SavedPageContent";
import { getPropertyListingsAsync } from "@/lib/propertiesAsync";

export const metadata: Metadata = {
  title: "Saved Properties",
  description: "Properties you've saved for later, kept on this device.",
  alternates: { canonical: "/saved" },
};

export default async function SavedPage() {
  const listings = await getPropertyListingsAsync();
  return <SavedPageContent listings={listings} />;
}
