import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { cookiePolicy } from "@/content/legal";
import { findPageContent } from "@/features/pages/repository";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "What this website stores in your browser, and why.",
  alternates: { canonical: "/cookies" },
};

export default async function CookiePolicyPage() {
  const page = (await findPageContent("cookies")) ?? cookiePolicy;
  return <LegalPageLayout page={page} />;
}
