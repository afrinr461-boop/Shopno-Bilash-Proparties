"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, LayoutDashboard, Home, Wallet, HardHat, FileText, UserCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/navigation/Logo";
import { PortalPageLoader } from "@/components/portal/PortalPageLoader";
import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { logoutAction } from "@/lib/auth/actions";
import type { OwnerNavItem } from "@/config/navigation";

export interface PortalShellProps {
  navItems: OwnerNavItem[];
  ownerName: string;
  unreadNotifications: number;
  children: React.ReactNode;
}

/**
 * Icons resolved client-side, keyed by label, rather than carried on
 * `navItems` — a `LucideIcon` component reference can't cross the
 * Server → Client Component boundary as a prop (RSC only allows plain
 * serializable data), so `buildOwnerNav` (a Server Component's import)
 * sends plain `{label, href}` and this Client Component owns the mapping.
 */
const NAV_ICONS: Record<string, LucideIcon> = {
  Home: LayoutDashboard,
  "My Property": Home,
  Payments: Wallet,
  Construction: HardHat,
  Documents: FileText,
  Notifications: Bell,
  Profile: UserCircle,
};

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

/**
 * Chapter 3's premium, mobile-first portal chrome — deliberately a fresh
 * component, not `SidebarShell` (that one is the admin panel's dense
 * internal-tool shell; this is meant to feel like "a private digital
 * home," per Prompt 1's own framing). Mobile gets a fixed bottom tab bar
 * (the primary experience, brief §12); the notification bell and profile
 * avatar live in the top bar instead of competing for bottom-bar space.
 * Desktop gets a full labelled sidebar — never a cut-down version of the
 * mobile experience. Visual pass: solid-fill active states (not just a
 * hairline), an avatar badge next to the owner's name, and one restrained
 * champagne accent line under the logo — the portal's one deliberate
 * "private club" signature, used nowhere else so it stays special.
 */
export function PortalShell({ navItems, ownerName, unreadNotifications, children }: PortalShellProps) {
  const pathname = usePathname();
  const homeHref = navItems[0]?.href ?? "/portal";
  const notificationsItem = navItems.find((i) => i.label === "Notifications");
  const profileItem = navItems.find((i) => i.label === "Profile");
  const tabBarItems = navItems.filter((i) => i.label !== "Notifications" && i.label !== "Profile").slice(0, 5);

  function isActive(href: string) {
    return href === homeHref ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="bg-bg flex min-h-screen">
      <PortalPageLoader navItems={navItems} />

      {/* Desktop sidebar */}
      <aside className="border-border bg-gradient-to-b from-surface to-surface-raised sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r lg:flex">
        <div className="border-premium/40 flex h-20 shrink-0 items-center border-b px-6">
          <Logo />
        </div>
        <div className="px-4 pt-5">
          <div className="bg-accent-soft/60 flex items-center gap-3 rounded-xl px-4 py-4">
            <span className="bg-accent text-accent-foreground text-label flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm">
              {initials(ownerName)}
            </span>
            <div className="min-w-0">
              <p className="text-caption text-fg-subtle uppercase">Welcome back</p>
              <p className="text-h4 text-fg mt-0.5 truncate">{ownerName}</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-5">
          {navItems.map((item) => {
            const Icon = NAV_ICONS[item.label];
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ease-[var(--ease-standard)]",
                  active ? "bg-accent text-accent-foreground shadow-sm" : "text-fg-muted hover:bg-surface-raised hover:text-fg",
                )}
              >
                {Icon && <Icon aria-hidden className="size-5 shrink-0" />}
                <span className={cn("text-nav flex-1", active && "font-medium")}>{item.label}</span>
                {item.label === "Notifications" && unreadNotifications > 0 && (
                  <span
                    className={cn(
                      "text-caption flex size-5 items-center justify-center rounded-full",
                      active ? "bg-accent-foreground/20 text-accent-foreground" : "bg-accent text-accent-foreground",
                    )}
                  >
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="border-border relative overflow-hidden border-t p-4">
          <ArchitecturalMotif
            fit="cover"
            className="text-border pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full opacity-30"
          />
          <button type="submit" className="text-fg-muted hover:bg-surface-raised hover:text-fg relative flex w-full items-center gap-3 rounded-md px-4 py-2.5 transition-colors">
            <LogOut aria-hidden className="size-4.5" />
            <span className="text-nav">Sign out</span>
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="border-border bg-bg/80 sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md lg:hidden">
          <Logo />
          <div className="flex items-center gap-1">
            {notificationsItem && (
              <Link href={notificationsItem.href} aria-label="Notifications" className="text-fg-muted hover:text-fg hover:bg-surface-raised relative flex size-10 items-center justify-center rounded-full transition-colors">
                <Bell aria-hidden className="size-5" />
                {unreadNotifications > 0 && (
                  <span aria-hidden className="bg-accent border-bg absolute top-1.5 right-1.5 size-2.5 rounded-full border-2" />
                )}
              </Link>
            )}
            {profileItem && (
              <Link href={profileItem.href} aria-label="Profile" className="ml-1">
                <span className="bg-accent text-accent-foreground text-label flex size-9 items-center justify-center rounded-full shadow-sm">
                  {initials(ownerName)}
                </span>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-0">{children}</main>

        {/* Mobile bottom tab bar */}
        <nav
          aria-label="Portal"
          className="border-border bg-surface/90 fixed inset-x-0 bottom-0 z-30 flex h-[4.75rem] items-stretch rounded-t-2xl border-t shadow-[0_-8px_24px_rgb(var(--shadow-color)/0.08)] backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          {tabBarItems.map((item) => {
            const Icon = NAV_ICONS[item.label];
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center justify-center gap-1"
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full px-3.5 py-1 transition-all duration-200 ease-[var(--ease-standard)]",
                    active ? "bg-accent-soft" : "",
                  )}
                >
                  {Icon && <Icon aria-hidden className={cn("size-5", active ? "text-accent" : "text-fg-subtle")} />}
                </span>
                <span className={cn("text-caption transition-colors", active ? "text-accent font-medium" : "text-fg-subtle")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
