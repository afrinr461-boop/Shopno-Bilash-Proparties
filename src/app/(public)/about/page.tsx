import type { Metadata } from "next";
import { BusinessModels } from "@/components/about/BusinessModels";
import { Closing } from "@/components/about/Closing";
import { Expertise } from "@/components/about/Expertise";
import { Impact } from "@/components/about/Impact";
import { Intro } from "@/components/about/Intro";
import { OurStory } from "@/components/about/OurStory";
import { Process } from "@/components/about/Process";
import { Values } from "@/components/about/Values";
import { Vision } from "@/components/about/Vision";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who Shopno Bilash Properties is, what we believe, how we work, and why buyers, landowners and investors can trust what we build.",
};

export default function AboutPage() {
  return (
    <>
      <Intro />
      <OurStory />
      <Vision />
      <Process />
      <BusinessModels />
      <Values />
      <Expertise />
      <Impact />
      <Closing />
    </>
  );
}
