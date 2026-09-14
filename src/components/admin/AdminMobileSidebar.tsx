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

/** Same nav content as `AdminSidebar`, in a `Drawer` for below `lg` — closes itself on navigation so a route change never leaves the drawer open over the new page. */
export function AdminMobileSidebar({ open, onClose, role, incompleteHrefs }: AdminMobileSidebarProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Shopno Bilash Admin" side="left">
      <div className="px-3 py-4">
        <AdminSidebarNav groups={ADMIN_NAV_GROUPS} role={role} incompleteHrefs={incompleteHrefs} onNavigate={onClose} />
      </div>
    </Drawer>
  );
}
