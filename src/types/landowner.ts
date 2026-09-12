import type { AuditFields, ID } from "./common";

export interface Landowner extends AuditFields {
  id: ID;
  userId?: ID;
  name: string;
  email: string;
  phone: string;
  /** Property IDs (raw land/property) this landowner brought to the company. */
  propertyIds: ID[];
}

export type AgreementStatus = "proposed" | "under-review" | "signed" | "active" | "completed" | "terminated";

/** A joint-venture development agreement between the company and a landowner. */
export interface Agreement extends AuditFields {
  id: ID;
  landownerId: ID;
  projectId?: ID;
  status: AgreementStatus;
  /** e.g. "landowner receives 35% of built units" — kept as free text; not modeled further at this stage. */
  termsSummary: string;
  signedDate?: string;
  documentIds: ID[];
}

/** Units/floors allocated back to the landowner under an agreement. */
export interface LandownerAllocation extends AuditFields {
  id: ID;
  agreementId: ID;
  landownerId: ID;
  unitId: ID;
}
