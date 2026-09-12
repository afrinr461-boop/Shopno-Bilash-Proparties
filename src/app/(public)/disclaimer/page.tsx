import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { propertyDisclaimer } from "@/content/legal";
import { findPageContent } from "@/features/pages/repository";

export const metadata: Metadata = {
  title: "Property Disclaimer",
  description: "How to read property and project information on the Shopno Bilash Properties website.",
  alternates: { canonical: "/disclaimer" },
};

export default async function DisclaimerPage() {
  const page = (await findPageContent("disclaimer")) ?? propertyDisclaimer;
  return <LegalPageLayout page={page} />;
}
