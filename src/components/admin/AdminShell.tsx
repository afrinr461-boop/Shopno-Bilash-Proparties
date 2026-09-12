"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/user";
import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileSidebar } from "./AdminMobileSidebar";
import { AdminHeader } from "./AdminHeader";

export interface AdminShellProps {
  user: User;
  children: ReactNode;
}

/**
 * AdminShell = Sidebar + Header + main content area (brief §4). Mounted
 * only inside `src/app/admin/layout.tsx`, after that layout's own
 * auth/staff-role gate — this component assumes `user` is real and never
 * re-checks permissions itself beyond what `AdminSidebar`'s nav filtering
 * already does. Deliberately not the public site's cinematic
 * `PageTransition`/`SitePageLoader` (brief §22) — plain instant
 * route swaps, since admin users prioritize speed over ceremony.
 */
export function AdminShell({ user, children }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="bg-bg flex min-h-screen">
      <AdminSidebar role={user.role} />
      <AdminMobileSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} role={user.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader user={user} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
