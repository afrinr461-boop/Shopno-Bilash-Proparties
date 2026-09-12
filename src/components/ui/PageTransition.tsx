"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { consumeSkipNextEntrance } from "@/lib/pageEntranceCoordination";

/**
 * Subtle entrance-only transition between route navigations: a fresh
 * `key={pathname}` remounts this wrapper on every navigation, retriggering
 * the `page-enter` CSS animation (globals.css). No exit animation, no
 * transition library — App Router doesn't give us an easy hook for the old
 * page's unmount, and a fade-out there isn't worth the complexity it'd add.
 *
 * Skipped for navigations the branded overlay (`SitePageLoader`)
 * just handled — its own wipe already reveals the page, so this fade would
 * play right after it and read as the page settling a second time. Still
 * plays normally for everything the overlay doesn't touch (reduced motion,
 * browser back/forward, a hard page load). Uses React's documented
 * "adjusting state when a prop changes" pattern (state, not a ref, so it's
 * safe to read/write during render) to consume the flag exactly once per
 * pathname change — an effect would run one paint too late.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [skip, setSkip] = useState(false);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setSkip(consumeSkipNextEntrance());
  }

  return (
    <div key={pathname} className={skip ? undefined : "page-enter"}>
      {children}
    </div>
  );
}
