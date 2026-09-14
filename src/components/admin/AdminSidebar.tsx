import Link from "next/link";
import Image from "next/image";
import { ADMIN_NAV_GROUPS } from "@/config/navigation";
import type { RoleName } from "@/config/roles";
import { AdminSidebarNav } from "./AdminSidebarNav";

export interface AdminSidebarProps {
  role: RoleName;
  incompleteHrefs: string[];
}

/**
 * Persistent desktop sidebar (`lg` and up) — hidden entirely below that;
 * `AdminMobileSidebar` covers narrower viewports via a drawer instead of
 * this shrinking. No collapse-to-rail toggle — this stack's environment
 * has a reproducible compositor bug where toggling the sidebar width
 * leaves it visually stuck, and a full-width, always-labelled sidebar is
 * simpler and more reliable anyway (`AdminSidebarNav`'s `collapsed` mode
 * still exists for any future caller that wants it).
 *
 * Three fixed regions, only the middle one scrolls: the logo header, the
 * scrollable nav groups, then "Help" pinned to the bottom always — it
 * used to be just the last group inside the same scrolling list, which
 * meant it scrolled out of view along with everything else instead of
 * staying reachable like a footer should.
 */
export function AdminSidebar({ role, incompleteHrefs }: AdminSidebarProps) {
  const scrollableGroups = ADMIN_NAV_GROUPS.filter((group) => group.label !== "Help");
  const helpGroup = ADMIN_NAV_GROUPS.filter((group) => group.label === "Help");

  return (
    <aside className="border-border bg-surface sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r lg:flex">
      <Link href="/admin" className="border-border flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Image src="/logo.webp" alt="" width={1477} height={1065} className="h-11 w-auto object-contain" />
        <span className="text-caption text-fg-subtle">Admin</span>
      </Link>

      <div className="thin-scrollbar flex-1 overflow-y-auto px-3 py-4">
        <AdminSidebarNav groups={scrollableGroups} role={role} incompleteHrefs={incompleteHrefs} />
      </div>

      <div className="border-border shrink-0 border-t px-3 py-4">
        <AdminSidebarNav groups={helpGroup} role={role} incompleteHrefs={incompleteHrefs} />
      </div>
    </aside>
  );
}
