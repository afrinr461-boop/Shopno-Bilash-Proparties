/**
 * Contact page copy/data. Evergreen company content (like content/about.ts),
 * not project-instance data.
 */

export const hero = {
  eyebrow: "Enquire",
  headline: "Let's build what comes next.",
  supporting:
    "Whether you're looking at a property, own land worth developing, want to talk partnership, or need a project managed — tell us a little, and our team will follow up directly.",
};

export interface ContactPath {
  value: string;
  label: string;
  description: string;
}

/**
 * The six real ways someone works with the company (matching /services'
 * capability list) — each drives which extra fields <EnquiryForm> shows.
 * Order matches the business's own priority: buyers first, then the two
 * project-facing paths, then the two partner-facing paths, general last.
 */
export const contactPaths: ContactPath[] = [
  { value: "property", label: "Buy a Property", description: "Interested in buying a flat, house or property." },
  { value: "project", label: "Explore a Project", description: "Want information about a specific development." },
  {
    value: "construction",
    label: "Construction / Project Management",
    description: "Need a development built or a project managed.",
  },
  { value: "land-jv", label: "Landowner / JV", description: "Interested in developing land or entering a joint venture." },
  {
    value: "investment",
    label: "Investment / Development Opportunity",
    description: "Interested in a development or business opportunity.",
  },
  { value: "general", label: "General Enquiry", description: "Any other question." },
];

export const closingStatement = "Every enquiry reaches a real person on our team — not a queue.";

export interface SocialLink {
  label: string;
  href: string;
}

export interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  socialLinks?: SocialLink[];
}

/**
 * Empty on purpose — no real office address, phone, email or social
 * accounts exist yet, and this site will never display invented contact
 * details (the brief for this step is explicit about this). <ContactInfoSection>
 * and the footer's "Connect" column both render nothing until real values
 * are added here.
 */
export const contactInfo: ContactInfo = {};
