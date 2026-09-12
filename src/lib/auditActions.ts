import { FileText, LogIn, LogOut, Activity as ActivityIcon, type LucideIcon } from "lucide-react";

/**
 * Single source for turning a raw `AuditLog.action` string into a
 * human label + icon — shared by the Dashboard's Recent Activity widget
 * and the full Audit Log page, so a new mutation only needs one entry
 * added here to show up correctly in both places.
 */
const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Signed in",
  "auth.logout": "Signed out",
  "content.news.create": "Created a News article",
  "content.news.update": "Updated a News article",
  "content.news.delete": "Deleted a News article",
  "content.project.create": "Created a Project",
  "content.project.update": "Updated a Project",
  "content.project.delete": "Deleted a Project",
  "content.unit.create": "Created a Property",
  "content.unit.update": "Updated a Property",
  "content.unit.delete": "Deleted a Property",
};

const ACTION_ICONS: Record<string, LucideIcon> = {
  "auth.login": LogIn,
  "auth.logout": LogOut,
  "content.news.create": FileText,
  "content.news.update": FileText,
  "content.news.delete": FileText,
  "content.project.create": FileText,
  "content.project.update": FileText,
  "content.project.delete": FileText,
  "content.unit.create": FileText,
  "content.unit.update": FileText,
  "content.unit.delete": FileText,
};

/** e.g. "ownershipTransfer.approve" → "Ownership Transfer — Approve" — a readable fallback for the many action strings recorded across every domain that don't have a bespoke phrasing in `ACTION_LABELS` above. */
function humanizeAction(action: string): string {
  return action
    .split(".")
    .map((part) =>
      part
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (c) => c.toUpperCase()),
    )
    .join(" — ");
}

export function describeAuditAction(action: string): { label: string; Icon: LucideIcon } {
  return {
    label: ACTION_LABELS[action] ?? humanizeAction(action),
    Icon: ACTION_ICONS[action] ?? ActivityIcon,
  };
}
