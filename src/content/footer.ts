/**
 * Global footer copy/data. Only routes that actually resolve to a real
 * page are listed — the footer must never contain dead links, even though
 * the header's "More" menu still points at a few routes from earlier
 * chapters that aren't built yet.
 */

export const statement = "Built on trust. Designed for the future.";

export const brandBlurb =
  "Property development, construction and joint-venture partnerships — one project at a time.";

/** Short trust markers shown under the footer's brand blurb, filling the column's remaining space with substance rather than blank padding. */
export const footerHighlights: string[] = [
  "Development, construction and sales — one team, start to finish.",
  "Transparent pricing and documentation on every unit.",
  "Structured, fairly-shared joint-venture partnerships.",
];

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

export const footerGroups: FooterGroup[] = [
  {
    title: "Explore",
    links: [
      { label: "Projects", href: "/projects" },
      { label: "Properties", href: "/properties" },
      { label: "Services", href: "/services" },
      { label: "Construction", href: "/construction" },
      { label: "Gallery", href: "/gallery" },
      { label: "News", href: "/news" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Landowners & JV", href: "/landowners" },
      { label: "Investment", href: "/landowners#investment" },
      { label: "Enquire", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Company Policy", href: "/policy" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Property Disclaimer", href: "/disclaimer" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
];

/** Compact secondary links repeated next to the copyright line. */
export const legalQuickLinks: FooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Sitemap", href: "/sitemap" },
];
