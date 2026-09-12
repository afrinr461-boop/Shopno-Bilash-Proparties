import en from "@/locales/en/common.json";
import bn from "@/locales/bn/common.json";

export const locales = ["en", "bn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries = { en, bn } satisfies Record<Locale, typeof en>;

/**
 * Foundation only — no locale routing/middleware is wired up yet. When the
 * customer/admin portals are built, swap this for route-based locale
 * resolution (e.g. `/bn/...` segments) while keeping this dictionary shape.
 */
export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
