/**
 * All About-page copy/data in one place, typed, for the same reason as
 * content/home.ts — a future Admin Panel should be able to own this
 * content without any About component needing to change.
 */

export const intro = {
  eyebrow: "About Shopno Bilash",
  statement: "A company built one honest project at a time.",
  supporting:
    "We're a real estate developer — but the work is really about land, trust, and the people who end up living with our decisions.",
};

/** Shown only while Admin → Content → Our Story has zero entries — see `companyMilestoneRepository`, the real (DB-backed, admin-editable) source for the timeline itself. */
export const storyFallback =
  "Every project we take on shapes how we approach the next one. We're still early in that story, and we'd rather grow it carefully — one development we can stand behind — than rush to fill a timeline.";

export const vision =
  "Developments that communities are proud to call home for generations, not just proud of at handover.";

export const process = [
  {
    title: "Discover",
    description:
      "We study the land, the neighborhood and the people who'll eventually live there before drawing a single plan.",
  },
  {
    title: "Plan",
    description:
      "Architectural and financial strategy get worked out together, so what gets built is livable and viable.",
  },
  {
    title: "Build",
    description:
      "Construction runs under one accountable team, with quality checked at every stage — not just the last.",
  },
  {
    title: "Deliver",
    description:
      "Handover is the start of the relationship, not the end of it — documentation and support included.",
  },
];

export const values = [
  {
    title: "Integrity",
    description:
      "We say what we mean in contracts and conversations alike — with buyers, landowners and partners.",
  },
  {
    title: "Transparency",
    description:
      "Progress, pricing and terms are shared plainly, not managed to look better than they are.",
  },
  {
    title: "Quality",
    description:
      "We choose durable materials and methods over whatever is fastest or cheapest.",
  },
  {
    title: "Long-Term Thinking",
    description:
      "Every decision is weighed against what a project will be worth — and cost — a decade from now.",
  },
  {
    title: "Accountability",
    description:
      "One team sees a project through, so responsibility never quietly changes hands.",
  },
];

export const expertise = [
  {
    title: "Land & Site Evaluation",
    description:
      "Assessing location, zoning and long-term development potential before committing to a project.",
  },
  {
    title: "Architectural & Financial Planning",
    description:
      "Balancing design ambition with a plan that's actually viable to build and sell.",
  },
  {
    title: "Construction & Quality Management",
    description:
      "Hands-on oversight of every stage of a build, not just the final inspection.",
  },
  {
    title: "Legal Structuring & Documentation",
    description:
      "Clear agreements for landowners, buyers and investors, written to be understood.",
  },
  {
    title: "Sales & Customer Relations",
    description:
      "Guiding buyers from reservation through handover — and staying reachable after.",
  },
  {
    title: "Landowner & Investor Partnerships",
    description:
      "Structuring joint ventures and investment arrangements that share value fairly.",
  },
];

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo?: { src: string; alt: string };
}

/**
 * Empty on purpose — no real leadership bios exist yet, and this page will
 * never show invented names/roles. <TeamSection> is fully built and ready;
 * the About page simply omits it while this stays empty.
 */
export const team: TeamMember[] = [];

export const closing = {
  statement:
    "We're not trying to build the most projects. We're trying to build the ones people trust.",
};
