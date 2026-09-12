import type { AuditFields, ID, Money } from "./common";

/**
 * A standalone property listing (buy/sell/resale) — distinct from `Project`,
 * which is an active multi-unit development. A `Property` may or may not
 * belong to a project (e.g. a resale flat inside a completed project still
 * gets its own listing).
 */
export type PropertyAvailability = "available" | "reserved" | "sold" | "unavailable";

export interface Property extends AuditFields {
  id: ID;
  slug: string;
  title: string;
  description: string;
  propertyType: string;
  projectId?: ID;

  address: string;
  city: string;
  area?: string;

  price: Money;
  sizeSqft: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  floor?: string;
  facing?: string;

  availability: PropertyAvailability;
  coverImage?: string;
  gallery: string[];

  isPublished: boolean;
}
