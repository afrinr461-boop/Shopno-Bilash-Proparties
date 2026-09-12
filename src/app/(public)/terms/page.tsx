import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { termsAndConditions } from "@/content/legal";
import { findPageContent } from "@/features/pages/repository";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms governing use of the Shopno Bilash Properties website.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const page = (await findPageContent("terms")) ?? termsAndConditions;
  return <LegalPageLayout page={page} />;
}
