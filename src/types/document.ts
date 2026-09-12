import type { AuditFields, DataVisibility, ID } from "./common";

export type DocumentOwnerType =
  | "company"
  | "project"
  | "unit"
  | "customer"
  | "shareholder"
  | "landowner"
  | "vendor"
  | "transaction"
  | "constructionActivity";

export type DocumentStatus = "draft" | "active" | "archived";

export interface Document extends AuditFields {
  id: ID;
  name: string;
  type: string; // MIME type or file extension
  category: string;
  ownerType: DocumentOwnerType;
  ownerId: ID;
  version: number;
  status: DocumentStatus;
  uploadedBy: ID;
  uploadDate: string;
  fileUrl: string;
  /** Bytes — only set for files that went through the real upload path (`src/lib/fileStorage.ts`). */
  fileSize?: number;
  /** Prompt 9 — optional expiry for agreements/licenses/renewable documents; absent means "doesn't expire," not "unknown," so the alert engine only ever flags documents that actually set this. */
  expiryDate?: string;
  /** Governs who may request `fileUrl` — checked server-side, never inferred from the UI. */
  visibility: DataVisibility;
}
