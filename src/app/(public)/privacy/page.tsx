import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { privacyPolicy } from "@/content/legal";
import { findPageContent } from "@/features/pages/repository";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Shopno Bilash Properties handles information submitted through this website.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const page = (await findPageContent("privacy")) ?? privacyPolicy;
  return <LegalPageLayout page={page} />;
}
