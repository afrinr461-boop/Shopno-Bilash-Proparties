import type { AuditFields, ID, Money } from "./common";

export type ProjectStatus =
  | "upcoming"
  | "planning"
  | "ongoing"
  | "ready"
  | "completed"
  | "suspended"
  | "cancelled";

export interface ProjectMedia {
  coverImage?: string;
  gallery: string[];
  renders: string[];
  videos: string[];
}

export interface Project extends AuditFields {
  id: ID;
  code: string;
  name: string;
  slug: string;
  description: string;

  // Location
  address: string;
  area?: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;

  // Land
  landAreaSqft?: number;
  plotInfo?: string;
  ownershipStructure?: string;
  landownerId?: ID;

  // Building
  propertyType: string;
  buildingCount: number;
  floorCount: number;
  unitCount: number;
  parkingCount?: number;
  amenities: string[];

  // Timeline
  launchDate?: string;
  constructionStartDate?: string;
  expectedCompletionDate?: string;
  handoverDate?: string;

  status: ProjectStatus;

  // Commercial (internal — see DataVisibility on Budget/actual-cost fields in finance types)
  salesStatus: "not-started" | "open" | "closed";
  budget?: Money;

  media: ProjectMedia;

  /** Whether this project is visible on the public website yet. */
  isPublished: boolean;
}

export type BuildingStatus = "planning" | "under-construction" | "completed";

export interface Building extends AuditFields {
  id: ID;
  projectId: ID;
  name: string;
  code?: string;
  status: BuildingStatus;
  /** Summary/convenience count — never enforced against real `Floor` rows, so an irregular building stays freely editable. */
  floorCount: number;
  coverImage?: string;
  gallery: string[];
  notes?: string;
}

export interface Floor extends AuditFields {
  id: ID;
  /** Denormalized from the building for project-scoping, matching every other domain's convention. */
  projectId: ID;
  buildingId: ID;
  label: string;
  floorNumber: number;
  /** Summary/convenience count — never enforced against real `Unit` rows. */
  unitCount: number;
  notes?: string;
}
