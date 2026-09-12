import Link from "next/link";
import type { ReactNode } from "react";
import type { NavItem } from "@/config/navigation";
import type { RoleName } from "@/config/roles";
import { hasPermission } from "@/lib/permissions";

export interface SidebarShellProps {
  navItems: NavItem[];
  role: RoleName;
  children: ReactNode;
}

/**
 * Shared shell for every sidebar-driven authenticated area (customer,
 * shareholder, landowner, admin). Items with a `permission` are hidden
 * unless `role` has it — the same centralized check the API layer will use,
 * so hiding a link is a convenience, never the actual access control.
 */
export function SidebarShell({ navItems, role, children }: SidebarShellProps) {
  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(role, item.permission),
  );

  return (
    <div className="flex flex-1 min-h-screen">
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-1 border-r border-border bg-surface p-4">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-nav rounded-md px-3 py-2 text-fg-muted hover:bg-surface-raised hover:text-fg transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
