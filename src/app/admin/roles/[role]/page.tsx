import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ROLES, ROLE_LABELS, type RoleName } from "@/config/roles";
import { ROLE_PERMISSIONS, PERMISSIONS, type Permission } from "@/config/permissions";

interface PageProps {
  params: Promise<{ role: string }>;
}

function isRoleName(value: string): value is RoleName {
  return (ROLES as readonly string[]).includes(value);
}

/**
 * Read-only permission breakdown for one role, grouped by domain
 * (`config/permissions.ts`'s `PERMISSIONS` grouping) — only domains this
 * role has at least one permission in are shown, so the page never
 * displays a wall of irrelevant "no access" rows.
 */
export default async function AdminRoleDetailPage({ params }: PageProps) {
  const { role: roleParam } = await params;

  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "roles.manage")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to view this role." />
      </div>
    );
  }

  if (!isRoleName(roleParam)) notFound();

  const granted = new Set<Permission>(ROLE_PERMISSIONS[roleParam]);
  const permissionsByDomain = PERMISSIONS as Record<string, readonly Permission[]>;
  const domains = Object.entries(permissionsByDomain)
    .map(([domain, actions]) => ({
      domain,
      actions,
      grantedActions: actions.filter((a) => granted.has(a)),
    }))
    .filter((d) => d.grantedActions.length > 0);

  return (
    <>
      <AdminPageHeader
        title={ROLE_LABELS[roleParam]}
        breadcrumbs={[{ label: "Roles & Permissions", href: "/admin/roles" }, { label: ROLE_LABELS[roleParam] }]}
        description={`${granted.size} of ${Object.values(PERMISSIONS).flat().length} permissions granted.`}
      />

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {domains.map(({ domain, actions, grantedActions }) => (
          <div key={domain} className="border-border bg-surface-raised flex flex-col gap-3 rounded-lg border p-4">
            <h2 className="text-label text-fg-subtle uppercase">{domain}</h2>
            <ul className="flex flex-col gap-2">
              {actions.map((action) => {
                const isGranted = grantedActions.includes(action);
                return (
                  <li key={action} className="text-body-sm flex items-center gap-2">
                    {isGranted ? (
                      <CheckCircle2 aria-hidden className="text-success size-4 shrink-0" />
                    ) : (
                      <Circle aria-hidden className="text-fg-subtle size-4 shrink-0" />
                    )}
                    <span className={isGranted ? "text-fg" : "text-fg-subtle"}>{action}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
