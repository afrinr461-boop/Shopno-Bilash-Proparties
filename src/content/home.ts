/**
 * All homepage storytelling copy/data in one place, typed, so a future
 * Admin Panel can own and edit this content without any homepage
 * component needing to change — components only ever read these shapes.
 */

export interface Statistic {
  label: string;
  /** null = not populated yet (Admin hasn't set a real figure). Never fake a number — render a placeholder instead. */
  value: number | null;
  suffix?: string;
}

export const companyStatement =
  "Development is a promise. We build ours to last.";

export const approach = {
  statement:
    "Good development isn't rushed. It's planned, built and delivered with intention — every time.",
  principles: [
    {
      title: "Thoughtful Planning",
      description:
        "Every project starts with the land, the neighborhood and the people who'll live there — not a floor plan.",
    },
    {
      title: "Durable Construction",
      description:
        "We build for decades of use, not just a handover date, with materials and methods chosen to last.",
    },
    {
      title: "Transparent Process",
      description:
        "Landowners, buyers and partners see clear terms and real progress — never guesswork.",
    },
    {
      title: "Long-Term Value",
      description:
        "We measure a project by what it's worth to the people who own it ten years on.",
    },
  ],
};

export const capabilities = [
  {
    title: "Property Development",
    description:
      "We plan and develop residential projects on our own land, engineered for long-term value.",
  },
  {
    title: "Construction & Delivery",
    description:
      "In-house project management sees every development through, from ground-breaking to handover.",
  },
  {
    title: "Property Sales",
    description:
      "We offer individual units and full developments directly, with transparent pricing and documentation.",
  },
  {
    title: "Landowner Partnerships",
    description:
      "We develop on landowners' land through structured joint-venture agreements, sharing value fairly.",
  },
  {
    title: "Investment Opportunities",
    description:
      "We create structured opportunities for investors to participate in our developments.",
  },
  {
    title: "Project Management",
    description:
      "Every project is planned, tracked and delivered under a single accountable team.",
  },
];

export interface FeaturedProjectContent {
  name: string;
  location: string;
  category: string;
  description: string;
  href: string;
  image: { src: string; alt: string };
}

/**
 * ⚠ DEMO DATA below (featuredProject, stats) — populated at the user's
 * request so the site is browsable for visual QA (2026-09-06). Not real
 * business information. Set featuredProject back to `null` and stats
 * values back to `null` once real figures/projects exist, or replace them
 * with the real thing.
 */
export const featuredProject: FeaturedProjectContent | null = {
  name: "Meridian Residences",
  location: "Gulshan 2, Dhaka",
  category: "Residential",
  description:
    "A 14-storey residential tower designed around light, air and long-term livability — 48 apartments, now under construction.",
  href: "/projects/meridian-residences",
  image: { src: "/placeholder-image.png", alt: "Placeholder architectural image" },
};

export const stats: Statistic[] = [
  { label: "Completed Projects", value: 8, suffix: "+" },
  { label: "Units Delivered", value: 320, suffix: "+" },
  { label: "Years of Experience", value: 10 },
  { label: "Landowner Partnerships", value: 5 },
];

export const trust = {
  statement: "We measure success in decades, not quarters.",
  pillars: [
    {
      title: "Transparent Contracts",
      description: "Every agreement — with buyers, landowners or partners — is written to be understood, not just signed.",
    },
    {
      title: "Engineered Quality",
      description: "Structural and material decisions are made for durability first, cost second.",
    },
    {
      title: "Accountable Delivery",
      description: "One team owns each project from planning to handover — no handoffs, no disappearing after the sale.",
    },
  ],
};

export const nextExploration = [
  {
    title: "Projects",
    description: "Every development we're currently building.",
    href: "/projects",
  },
  {
    title: "Properties",
    description: "Available units, ready to reserve or buy.",
    href: "/properties",
  },
  {
    title: "About",
    description: "Who we are and how we work.",
    href: "/about",
  },
  {
    title: "Services",
    description: "What we offer landowners, buyers and investors.",
    href: "/services",
  },
];
