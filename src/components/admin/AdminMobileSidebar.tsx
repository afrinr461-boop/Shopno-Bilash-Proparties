"use client";

import { Drawer } from "@/components/ui/Drawer";
import { ADMIN_NAV_GROUPS } from "@/config/navigation";
import type { RoleName } from "@/config/roles";
import { AdminSidebarNav } from "./AdminSidebarNav";

export interface AdminMobileSidebarProps {
  open: boolean;
  onClose: () => void;
  role: RoleName;
  incompleteHrefs: string[];
}

/**
 * Same nav content as `AdminSidebar`, in a `Drawer` for below `lg` —
 * closes itself on navigation so a route change never leaves the drawer
 * open over the new page. "Help" is `sticky bottom-0` within the
 * drawer's own scroll region (the `Drawer` component itself only offers
 * one scrollable body, unlike the desktop sidebar's separate fixed
 * footer slot) so it stays reachable instead of scrolling away with the
 * rest of the nav.
 */
export function AdminMobileSidebar({ open, onClose, role, incompleteHrefs }: AdminMobileSidebarProps) {
  const scrollableGroups = ADMIN_NAV_GROUPS.filter((group) => group.label !== "Help");
  const helpGroup = ADMIN_NAV_GROUPS.filter((group) => group.label === "Help");

  return (
    <Drawer open={open} onClose={onClose} title="Shopno Bilash Admin" side="left">
      <div className="px-3 pt-4">
        <AdminSidebarNav groups={scrollableGroups} role={role} incompleteHrefs={incompleteHrefs} onNavigate={onClose} />
      </div>
      <div className="bg-bg border-border sticky bottom-0 border-t px-3 py-4">
        <AdminSidebarNav groups={helpGroup} role={role} incompleteHrefs={incompleteHrefs} onNavigate={onClose} />
      </div>
    </Drawer>
  );
}
