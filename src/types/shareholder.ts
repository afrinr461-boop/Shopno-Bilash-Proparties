import type { AuditFields, ID, Money } from "./common";

export interface Shareholder extends AuditFields {
  id: ID;
  userId?: ID;
  name: string;
  email: string;
  phone: string;
}

/**
 * A shareholder's stake in one project — the record that scopes access.
 * A shareholder must only ever resolve `Shareholding` rows where
 * `shareholderId` matches their own record (ARCHITECTURE.md §13 Security).
 */
export interface Shareholding extends AuditFields {
  id: ID;
  shareholderId: ID;
  projectId: ID;
  sharePercentage: number;
  totalContribution: Money;
  /** Unit IDs allocated to this shareholder within the project, if any. */
  allocatedUnitIds: ID[];
}
