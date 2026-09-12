/**
 * Services page copy. Deliberately built ON TOP of `content/home.ts`'s
 * `capabilities` (the same six business lines already presented in
 * <WhatWeDo> on the homepage) rather than a second, possibly-drifting list —
 * this file only adds Services-specific presentation metadata (who each
 * service is for, what it concretely involves, where its CTA should go).
 * Titles/descriptions always come from `capabilities`, so the two pages
 * can never say different things about what the company does.
 */
import { capabilities } from "./home";

export const hero = {
  eyebrow: "Services",
  headline: "What we actually do.",
  supporting:
    "Six ways of working with Shopno Bilash Properties — as a buyer, a landowner, an investor, or simply someone who wants to see how a development gets made.",
};

export interface ServiceDetail {
  id: string;
  /** Concrete, non-invented elaboration of the capability's own description — never a new claim. */
  handles: string[];
  whoFor: string;
  ctaLabel: string;
  ctaHref: string;
  /** Featured services get the full image + chapter treatment; the rest stay in the compact index. */
  featured: boolean;
}

const details: ServiceDetail[] = [
  {
    id: "property-development",
    handles: [
      "Site and land evaluation",
      "Architectural and financial planning",
      "End-to-end delivery, from concept to handover",
    ],
    whoFor: "Anyone who wants to see how a piece of land becomes a livable, well-planned development.",
    ctaLabel: "Explore Our Projects",
    ctaHref: "/projects",
    featured: true,
  },
  {
    id: "construction-delivery",
    handles: [
      "In-house project management",
      "Quality oversight at every construction stage",
      "Project-specific progress updates",
    ],
    whoFor: "Buyers and partners who want real visibility into how a project is actually progressing.",
    ctaLabel: "See Construction in Progress",
    ctaHref: "/projects",
    featured: false,
  },
  {
    id: "property-sales",
    handles: [
      "Individual units across active developments",
      "Transparent pricing and documentation",
      "Direct sales — no third-party agents",
    ],
    whoFor: "Buyers looking for one specific apartment, house or commercial unit.",
    ctaLabel: "Browse Available Properties",
    ctaHref: "/properties",
    featured: false,
  },
  {
    id: "landowner-partnerships",
    handles: [
      "Land and site evaluation",
      "Project-specific joint-venture agreements",
      "Planning, construction and handover, managed end-to-end",
    ],
    whoFor: "Landowners who want their land developed without taking on construction expertise themselves.",
    ctaLabel: "Explore Landowner Partnerships",
    ctaHref: "/landowners",
    featured: true,
  },
  {
    id: "investment-opportunities",
    handles: [
      "Project-specific investment structures",
      "Terms agreed in writing before work begins",
      "A direct conversation, not a fixed pitch",
    ],
    whoFor: "Investors and development partners interested in a specific, real project.",
    ctaLabel: "Explore Investment Opportunities",
    ctaHref: "/landowners#investment",
    featured: false,
  },
  {
    id: "project-management",
    handles: [
      "One accountable team per project",
      "Planning, budget and timeline tracking",
      "A single point of contact throughout",
    ],
    whoFor: "Everyone we work with — it's how every other service here actually gets delivered.",
    ctaLabel: "Talk to Our Team",
    ctaHref: "/contact?type=general",
    featured: false,
  },
];

export interface Service extends ServiceDetail {
  number: string;
  title: string;
  description: string;
}

export const services: Service[] = capabilities.map((capability, i) => ({
  ...details[i],
  number: String(i + 1).padStart(2, "0"),
  title: capability.title,
  description: capability.description,
}));

export const pathways = [
  { prompt: "I want to buy a property", label: "Browse Properties", href: "/properties" },
  { prompt: "I have land to develop", label: "Landowners & JV", href: "/landowners" },
  { prompt: "I'm interested in investing", label: "Investment Opportunities", href: "/landowners#investment" },
  { prompt: "I need construction or project management", label: "Talk to Our Team", href: "/contact?type=general" },
];
