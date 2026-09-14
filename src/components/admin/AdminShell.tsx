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
  /** Hrefs of nav items missing data worth flagging — see `src/lib/adminCompleteness.ts`. */
  incompleteHrefs: string[];
}

/**
 * AdminShell = Sidebar + Header + main content area (brief §4). Mounted
 * only inside `src/app/admin/layout.tsx`, after that layout's own
 * auth/staff-role gate — this component assumes `user` is real and never
 * re-checks permissions itself beyond what `AdminSidebar`'s nav filtering
 * already does. Deliberately not the public site's cinematic
 * `PageTransition`/`SitePageLoader` (brief §22) — plain instant
 * route swaps, since admin users prioritize speed over ceremony.
 *
 * Both `AdminSidebar` and `AdminHeader` are `position: fixed` (see their
 * own comments for why), so neither occupies space in this flex row —
 * the content column gets `lg:pl-64` for the sidebar's width and
 * `<main>` gets `pt-16` for the header's height instead, so nothing
 * renders underneath either.
 */
export function AdminShell({ user, children, incompleteHrefs }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="bg-bg flex min-h-screen">
      <AdminSidebar role={user.role} incompleteHrefs={incompleteHrefs} />
      <AdminMobileSidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        role={user.role}
        incompleteHrefs={incompleteHrefs}
      />

      <div className="min-w-0 flex-1 lg:pl-64">
        <AdminHeader user={user} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="min-w-0 pt-16">{children}</main>
      </div>
    </div>
  );
}
