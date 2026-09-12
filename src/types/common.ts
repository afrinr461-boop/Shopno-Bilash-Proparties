/** Shared primitives every domain type builds on. */

export type ID = string;

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface AuditFields extends Timestamps {
  createdBy: ID;
  updatedBy?: ID;
}

export type CurrencyCode = "BDT";

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface Address {
  addressLine: string;
  area?: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Data-visibility classification (ARCHITECTURE.md §7). Every entity that
 * carries sensitive fields should be able to say which bucket a given field
 * belongs to — this is metadata for authorization/serialization layers to
 * consume, not a UI concern.
 */
export type DataVisibility = "public" | "private" | "internal" | "restricted";
