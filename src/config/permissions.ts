import { ROLES, type RoleName } from "./roles";

/**
 * Every permission identifier in the system, grouped by domain. UI
 * components and API route handlers check membership in this list via
 * `hasPermission()` (src/lib/permissions.ts) — never a raw role comparison.
 */
export const PERMISSIONS = {
  project: ["project.view", "project.create", "project.update", "project.delete", "project.publish"],
  property: ["property.view", "property.create", "property.update", "property.delete"],
  unit: ["unit.view", "unit.manage"],
  parking: ["parking.view", "parking.manage"],
  customer: ["customer.view", "customer.create", "customer.update", "customer.delete"],
  lead: ["lead.view", "lead.manage", "lead.assign"],
  sales: ["sales.view", "sales.create", "sales.update", "sales.delete"],
  finance: ["finance.view", "finance.manage", "finance.export"],
  shareholder: ["shareholder.view", "shareholder.manage"],
  landowner: ["landowner.view", "landowner.manage"],
  procurement: ["procurement.view", "procurement.manage"],
  construction: ["construction.view", "construction.manage"],
  documents: ["documents.view", "documents.upload", "documents.delete"],
  // CMS Step 1 — the public website's editable content (News first;
  // Projects/Properties/Gallery/Pages follow the same domain later).
  content: ["content.view", "content.create", "content.update", "content.delete", "content.publish"],
  reports: ["reports.view", "reports.export"],
  users: ["users.view", "users.manage"],
  roles: ["roles.manage"],
  permissions: ["permissions.manage"],
  settings: ["settings.manage"],
  audit: ["audit.view"],
  notifications: ["notifications.view", "notifications.manage"],
  reminders: ["reminders.view", "reminders.manage"],
  approvals: ["approvals.view", "approvals.manage"],
  alerts: ["alerts.view"],
} as const;

type PermissionGroups = typeof PERMISSIONS;
export type Permission = PermissionGroups[keyof PermissionGroups][number];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flat() as Permission[];

const withoutApexOnly = ALL_PERMISSIONS.filter(
  (p) => p !== "roles.manage" && p !== "permissions.manage",
);

/**
 * Default role → permission matrix. This is a starting point for the
 * platform, not the full authorization story: several domains (shareholder
 * financials, customer documents, landowner agreements) also need
 * record-level scoping — e.g. a shareholder with `shareholder.view` must
 * still only resolve *their own* shareholding, never another shareholder's.
 * See ARCHITECTURE.md §13 Security Architecture.
 */
export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  managing_director: withoutApexOnly,

  finance_manager: [
    "finance.view", "finance.manage", "finance.export",
    "reports.view", "reports.export",
    "project.view", "unit.view", "customer.view",
    "documents.view", "documents.upload",
    "reminders.view", "reminders.manage", "approvals.view", "approvals.manage", "alerts.view",
  ],
  project_manager: [
    "project.view", "project.create", "project.update", "project.publish",
    "unit.view", "unit.manage",
    "parking.view", "parking.manage",
    "construction.view", "construction.manage",
    "documents.view", "documents.upload",
    "reports.view",
    "finance.view",
    "reminders.view", "reminders.manage", "approvals.view", "approvals.manage", "alerts.view",
  ],
  sales_manager: [
    "lead.view", "lead.manage", "lead.assign",
    "sales.view", "sales.create", "sales.update",
    "customer.view", "customer.create", "customer.update",
    "unit.view", "project.view",
    "parking.view", "parking.manage",
    "property.view", "property.create", "property.update",
    "documents.view", "documents.upload",
    "reports.view",
    "reminders.view", "reminders.manage", "alerts.view",
  ],
  sales_executive: [
    "lead.view", "lead.manage",
    "sales.view", "sales.create", "sales.update",
    "customer.view", "unit.view", "project.view", "property.view",
    "documents.view",
    "reminders.view", "reminders.manage", "alerts.view",
  ],
  procurement_manager: [
    "procurement.view", "procurement.manage",
    "documents.view", "documents.upload",
    "project.view", "reports.view",
    "reminders.view", "reminders.manage", "alerts.view",
  ],
  construction_manager: [
    "construction.view", "construction.manage",
    "project.view", "unit.view",
    "documents.view", "documents.upload",
    "reminders.view", "reminders.manage", "alerts.view",
  ],
  document_manager: [
    "documents.view", "documents.upload", "documents.delete",
    "project.view", "customer.view", "shareholder.view", "landowner.view",
    "reminders.view", "reminders.manage", "alerts.view",
  ],

  // Portal roles: intentionally narrow. Record-level scoping (own unit, own
  // shareholding, own agreement) is enforced by the API layer, not by this
  // matrix — the permission only gates *which kind* of data the role may
  // ever see, not *whose*.
  customer: ["unit.view", "project.view", "documents.view"],
  shareholder: ["shareholder.view", "unit.view", "project.view", "documents.view"],
  landowner: ["landowner.view", "project.view", "documents.view"],
};

// Fail loudly at import time if a role is missing from the matrix — cheaper
// than discovering it as a silent permission-denied bug in production.
for (const role of ROLES) {
  if (!(role in ROLE_PERMISSIONS)) {
    throw new Error(`ROLE_PERMISSIONS is missing an entry for role "${role}"`);
  }
}
