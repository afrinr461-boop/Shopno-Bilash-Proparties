import type { OwnerNavItem } from "@/config/navigation";

/**
 * Destination-title resolution for `PortalPageLoader`'s "Entering …"
 * curtain stage — mirrors `lib/routeTitles.ts`'s public-site version, but
 * against the portal's own small nav label list instead of live CMS data.
 *
 * Longest-prefix match against `navItems`: "Home" (`href` = the portal
 * base, e.g. "/portal") is itself a prefix of every other item's `href`,
 * so a dynamic sub-route like "/portal/payments/<unitId>" must resolve
 * against the LONGEST matching entry ("Payments") rather than the first
 * one found, or every route would misresolve to "Home".
 */
export function getOwnerPortalRouteTitle(pathname: string, navItems: OwnerNavItem[]): string {
  let best: OwnerNavItem | undefined;
  for (const item of navItems) {
    if (pathname !== item.href && !pathname.startsWith(`${item.href}/`)) continue;
    if (!best || item.href.length > best.href.length) best = item;
  }
  if (best) return best.label;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Home";
  return segments[segments.length - 1].replace(/-/g, " ");
}
