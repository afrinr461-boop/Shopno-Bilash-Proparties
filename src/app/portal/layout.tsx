import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PortalShell } from "@/components/portal/PortalShell";
import { PORTAL_NAV, SHAREHOLDER_NAV, LANDOWNER_NAV } from "@/config/navigation";
import { resolveOwnerContext } from "@/lib/ownerContext";
import { getOwnerNotifications } from "@/features/ownerPortal/queries";
import { companySettingsRepository, COMPANY_SETTINGS_ID } from "@/features/settings/repository";

/**
 * Chapter 3 — the authenticated portal shell, covering customer,
 * shareholder, and landowner areas under one auth gate (the redirect
 * decides which by role, mirroring `lib/auth/actions.ts`'s own mapping).
 * Not signed in → straight to `/login` (the owner tab), not a stub
 * "sign in to continue" page — there is a real, working login now.
 */
export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const navItems = user.role === "shareholder" ? SHAREHOLDER_NAV : user.role === "landowner" ? LANDOWNER_NAV : PORTAL_NAV;

  const ownerContext = resolveOwnerContext(user);
  const notifications = ownerContext ? await getOwnerNotifications(ownerContext.ownerType, ownerContext.ownerId) : [];
  const unreadCount = notifications.filter((n) => (n.status ?? (n.readAt ? "read" : "unread")) === "unread").length;
  const settings = await companySettingsRepository.findById(COMPANY_SETTINGS_ID);

  return (
    <PortalShell navItems={navItems} ownerName={user.name} unreadNotifications={unreadCount} settings={settings}>
      {children}
    </PortalShell>
  );
}
