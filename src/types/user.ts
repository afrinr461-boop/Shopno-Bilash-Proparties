import type { AuditFields, ID } from "./common";
import type { RoleName } from "@/config/roles";

export type UserStatus = "active" | "invited" | "suspended" | "disabled";

export interface User extends AuditFields {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: RoleName;
  status: UserStatus;
  /** Set only for Customer/Shareholder/Landowner roles — links the account to its domain record. */
  linkedCustomerId?: ID;
  linkedShareholderId?: ID;
  linkedLandownerId?: ID;
  lastLoginAt?: string;
  /**
   * Projects this staff member can see — ignored for `super_admin`/
   * `managing_director`, who always see everything (see
   * `src/lib/projectScope.ts`). Undefined/empty for a brand-new staff
   * account means "sees nothing yet" in project-scoped modules, not
   * "sees everything" — an admin must explicitly assign at least one
   * project.
   */
  assignedProjectIds?: ID[];
}
