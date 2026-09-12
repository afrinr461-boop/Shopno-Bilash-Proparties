/**
 * Legal-page copy — general, structurally sound policy language covering
 * the topics a real-estate marketing website needs, written so it can be
 * reviewed and refined by the company's own legal adviser before launch.
 * Deliberately avoids: specific law/certification/compliance claims that
 * haven't been verified, invented registration numbers, and any guarantee
 * language. Everything here describes the website as it actually behaves
 * (the enquiry form, local-storage recent searches, no analytics/ads).
 */

export interface LegalSection {
  heading: string;
  body: string[];
  list?: string[];
}

export interface LegalPage {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

/** One of the four fixed legal-page slugs — the set itself isn't editable (you can't add or delete a "Privacy Policy"), only each page's own copy is. */
export type PageContentId = "privacy" | "terms" | "disclaimer" | "cookies";

export interface PageContent extends LegalPage {
  id: PageContentId;
}

const LAST_UPDATED = "September 2026";
const COMPANY = "Shopno Bilash Properties Ltd.";

export const privacyPolicy: LegalPage = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  lastUpdated: LAST_UPDATED,
  intro:
    "This policy explains what information this website collects, how it's used, and the choices available to you. It covers the public Shopno Bilash Properties website only.",
  sections: [
    {
      heading: "Information You Provide",
      body: [
        `The main way this website collects information is through the Enquire form. If you submit an enquiry, ${COMPANY} receives whatever you choose to include — typically your name, contact details, and the nature of your enquiry (for example, a specific project, property, or partnership interest).`,
      ],
    },
    {
      heading: "Information Stored in Your Browser",
      body: [
        "A small amount of information is stored locally in your own browser, not on a server, and is never transmitted anywhere:",
      ],
      list: [
        "Recent search terms, used only to speed up your next visit to the search feature — cleared automatically when you clear them, or by clearing your browser data.",
        "Saved properties, if you use the save feature, so your shortlist is there the next time you visit on the same device and browser.",
      ],
    },
    {
      heading: "How Information Is Used",
      body: [
        "Enquiry information is used solely to respond to your enquiry and to have the relevant conversation about a project, property, partnership, or investment interest. It is not sold, rented, or shared with third parties for marketing purposes.",
      ],
    },
    {
      heading: "Communication",
      body: [
        "If you submit an enquiry, a member of the team may contact you using the details you provided, to follow up on that specific enquiry.",
      ],
    },
    {
      heading: "Cookies and Similar Technology",
      body: [
        "This website does not use tracking or advertising cookies, and does not run third-party analytics. The local-storage items described above (recent searches, saved properties) are the only client-side data this site stores, and they stay on your device.",
      ],
    },
    {
      heading: "Third-Party Services",
      body: [
        "This website does not currently share visitor or enquiry data with third-party services. If that changes in the future — for example, to support customer communication or a future customer portal — this policy will be updated to name the service and explain its role before that happens.",
      ],
    },
    {
      heading: "Data Protection Principles",
      body: [
        `${COMPANY} aims to collect only the information needed to respond to enquiries, to keep it only as long as reasonably necessary for that purpose, and to take reasonable steps to protect it. This section will be expanded with specific retention periods and safeguards once confirmed by the company's legal adviser.`,
      ],
    },
    {
      heading: "Your Rights",
      body: [
        "You can ask what information has been submitted on your behalf, request a correction, or ask for it to be deleted, by contacting the company through the Enquire page.",
      ],
    },
    {
      heading: "Changes to This Policy",
      body: [
        "This policy may be updated as the website or the company's practices change. The date at the top of this page reflects the most recent update.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Questions about this policy can be sent through the Enquire page, selecting a general enquiry.",
      ],
    },
  ],
};

export const termsAndConditions: LegalPage = {
  eyebrow: "Legal",
  title: "Terms & Conditions",
  lastUpdated: LAST_UPDATED,
  intro: `These terms govern your use of this website. By using it, you agree to them. This page describes website use only — a specific transaction or partnership is governed by its own written agreement with ${COMPANY}, not by this page.`,
  sections: [
    {
      heading: "Use of This Website",
      body: [
        "This website is provided for general information about Shopno Bilash Properties, its developments, and its services. You may browse it and submit enquiries in good faith. You agree not to misuse the website, attempt to disrupt it, or use it for any unlawful purpose.",
      ],
    },
    {
      heading: "Content Accuracy",
      body: [
        "Reasonable care is taken to keep the information on this website accurate and current. However, property information, project timelines, and company information can change, and errors can occur. Nothing on this website should be relied on as final without direct confirmation from the company.",
      ],
    },
    {
      heading: "Property Information, Availability & Prices",
      body: [
        "Details shown for projects and properties — including price, availability, area, specifications, and completion information — are provided for general guidance and may change without notice. Current figures should always be confirmed directly with the company before you make a decision based on them.",
      ],
    },
    {
      heading: "Images and Renderings",
      body: [
        "Project and property images may include architectural renderings, proposed designs, or photography from different stages of construction. Final specifications, finishes, and surroundings may differ from what's shown.",
      ],
    },
    {
      heading: "Enquiry Submissions",
      body: [
        "Submitting an enquiry through this website does not create a booking, reservation, contract, or any binding obligation on either side. It is the start of a conversation.",
      ],
    },
    {
      heading: "Intellectual Property",
      body: [
        `The content of this website — including text, layout, and original graphics — belongs to ${COMPANY} unless stated otherwise. It may not be reproduced for commercial purposes without permission.`,
      ],
    },
    {
      heading: "External Links",
      body: [
        "This website may link to third-party destinations (for example, a map service). The company is not responsible for the content or practices of external websites.",
      ],
    },
    {
      heading: "Changes to This Website",
      body: [
        "Content, features, and these terms may be updated at any time as the website and the business evolve.",
      ],
    },
    {
      heading: "Contact",
      body: ["Questions about these terms can be sent through the Enquire page."],
    },
  ],
};

export const propertyDisclaimer: LegalPage = {
  eyebrow: "Legal",
  title: "Property Disclaimer",
  lastUpdated: LAST_UPDATED,
  intro:
    "Real estate information changes over time. This page sets out how project and property information on this website should be read.",
  sections: [
    {
      heading: "General Information Only",
      body: [
        "Project and property information on this website — including descriptions, specifications, and construction updates — is provided for general informational purposes and does not constitute a contractual offer.",
      ],
    },
    {
      heading: "Availability & Pricing May Change",
      body: [
        "Unit availability and pricing shown on this website reflect the company's records at the time of publishing and are subject to change without prior notice. Please confirm current availability and pricing directly with the company before making a decision.",
      ],
    },
    {
      heading: "Renderings & Representative Images",
      body: [
        "Images described as renderings, concepts, or proposed designs represent the current design intent and may differ from the final built result. Interior and exterior finishes, landscaping, and furnishing shown are often representative rather than final.",
      ],
    },
    {
      heading: "Construction Progress",
      body: [
        "Construction updates and progress figures reflect the project's status as of the date they were published and are not guaranteed indicators of a final completion date.",
      ],
    },
    {
      heading: "Confirm Before Deciding",
      body: [
        "Before making any financial or legal decision related to a project or property, please contact the company directly to confirm current details, documentation, and terms.",
      ],
    },
  ],
};

export const cookiePolicy: LegalPage = {
  eyebrow: "Legal",
  title: "Cookie Policy",
  lastUpdated: LAST_UPDATED,
  intro:
    "This website keeps things simple: it doesn't use tracking or advertising cookies. This page explains the small amount of data it does store, and why.",
  sections: [
    {
      heading: "No Tracking Cookies",
      body: [
        "This website does not set cookies for advertising, tracking, or third-party analytics purposes.",
      ],
    },
    {
      heading: "Local Storage",
      body: [
        "Two features use your browser's local storage — a place data can be kept on your own device, not sent to any server:",
      ],
      list: [
        "Recent searches — the last few terms you searched, so they're quick to reuse. You can clear them at any time from within the search feature.",
        "Saved properties — properties you've marked to come back to, kept on this device and browser only.",
      ],
    },
    {
      heading: "Managing This Data",
      body: [
        "You can clear either of the above at any time from within the relevant feature, or remove them entirely by clearing your browser's site data for this website.",
      ],
    },
    {
      heading: "Changes",
      body: [
        "If this website's use of cookies or local storage changes in the future, this page will be updated to reflect it.",
      ],
    },
  ],
};
