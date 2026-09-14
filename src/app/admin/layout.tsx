import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { Container } from "@/components/ui/Container";
import { STAFF_ROLES } from "@/config/roles";
import { getIncompleteNavHrefs } from "@/lib/adminCompleteness";

/**
 * Admin / management platform shell (Layer C). Gated on both "is signed in"
 * and "is a staff role" — a customer/shareholder/landowner account must
 * never reach this shell even if authenticated elsewhere. `AdminShell`
 * (Admin Step 2) replaces the generic `SidebarShell` used here previously —
 * `SidebarShell` still backs `/portal/*`, unchanged.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user || !STAFF_ROLES.includes(user.role)) {
    return (
      <main className="flex-1 py-16">
        <Container size="narrow">
          <PermissionDeniedState description="Sign in with a staff account to access the admin platform." />
        </Container>
      </main>
    );
  }

  const incompleteHrefs = await getIncompleteNavHrefs();

  return (
    <AdminShell user={user} incompleteHrefs={incompleteHrefs}>
      {children}
    </AdminShell>
  );
}
