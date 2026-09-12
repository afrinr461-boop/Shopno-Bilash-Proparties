/**
 * The platform's role set (ARCHITECTURE.md §4 — User Role Matrix). Roles are
 * data, not code branches — never write `if (role === "admin")` in a
 * component. Check a permission via `hasPermission()` (src/lib/permissions.ts)
 * instead, so adding a role never requires touching UI components.
 */
export const ROLES = [
  "super_admin",
  "managing_director",
  "finance_manager",
  "project_manager",
  "sales_manager",
  "sales_executive",
  "procurement_manager",
  "construction_manager",
  "document_manager",
  "customer",
  "shareholder",
  "landowner",
] as const;

export type RoleName = (typeof ROLES)[number];

export const ROLE_LABELS: Record<RoleName, string> = {
  super_admin: "Super Admin",
  managing_director: "Managing Director / Owner",
  finance_manager: "Finance Manager",
  project_manager: "Project Manager",
  sales_manager: "Sales Manager",
  sales_executive: "Sales Executive",
  procurement_manager: "Procurement Manager",
  construction_manager: "Construction Manager",
  document_manager: "Document / Legal Manager",
  customer: "Customer",
  shareholder: "Shareholder",
  landowner: "Landowner",
};

/** Roles that belong to the internal management platform (Layer C). */
export const STAFF_ROLES: RoleName[] = [
  "super_admin",
  "managing_director",
  "finance_manager",
  "project_manager",
  "sales_manager",
  "sales_executive",
  "procurement_manager",
  "construction_manager",
  "document_manager",
];

/** Roles that belong to the authenticated portal (Layer B). */
export const PORTAL_ROLES: RoleName[] = ["customer", "shareholder", "landowner"];

/** Where a signed-in portal role lands — the one place this mapping is decided, shared by both login flows (`lib/auth/actions.ts` staff/email, `lib/auth/ownerActions.ts` owner/PIN) and the already-signed-in redirect on `/login`. */
export function getPortalHomePath(role: RoleName): string {
  if (role === "shareholder") return "/portal/shareholder";
  if (role === "landowner") return "/portal/landowner";
  return "/portal";
}
