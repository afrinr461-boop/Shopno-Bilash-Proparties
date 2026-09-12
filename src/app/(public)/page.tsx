import type { Metadata } from "next";
import { Achievements } from "@/components/home/Achievements";
import { CompanyStatement } from "@/components/home/CompanyStatement";
import { FeaturedDevelopment } from "@/components/home/FeaturedDevelopment";
import { Hero } from "@/components/home/Hero";
import { NextExploration } from "@/components/home/NextExploration";
import { OurApproach } from "@/components/home/OurApproach";
import { PortfolioStrip } from "@/components/home/PortfolioStrip";
import { Trust } from "@/components/home/Trust";
import { WhatWeDo } from "@/components/home/WhatWeDo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <CompanyStatement />
      <OurApproach />
      <WhatWeDo />
      <PortfolioStrip />
      <FeaturedDevelopment />
      <Achievements />
      <Trust />
      <NextExploration />
    </>
  );
}
