import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { STAFF_ROLES } from "@/config/roles";

/**
 * First line of defense for `/admin/*` and `/portal/*` (Admin Step 3
 * brief §8/§32) — runs on the Edge runtime before any page component
 * renders, so a signed-out request never even reaches `AdminLayout`/
 * `PortalLayout`'s own server-side check. Those layout checks stay in
 * place too (defense in depth, not redundancy) — this only verifies the
 * token's signature/expiry and, for `/admin/*`, that its role is a staff
 * role; it never touches the user repository (Edge can't use
 * `node:crypto`-based `lib/auth/password.ts`, and doesn't need to here).
 *
 * Named `proxy.ts`/`export function proxy`, not the older `middleware.ts`/
 * `middleware` — Next.js 16.3 renamed the convention (the old name still
 * works but logs a deprecation warning at build time); this is a new file
 * this step, so it uses the current name directly. Lives at `src/proxy.ts`,
 * not the project root, since this project uses a `src/` directory for
 * everything under `src/app`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/portal");

  if (!isAdminRoute && !isPortalRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !STAFF_ROLES.includes(session.role)) {
    // Signed in, just not staff — send them to their own area rather than
    // back to /login (they don't need to re-authenticate, they simply
    // don't have access to this one). AdminLayout's own check renders the
    // real PermissionDeniedState for anyone who somehow still reaches it.
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
