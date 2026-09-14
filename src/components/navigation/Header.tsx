"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { DesktopNav } from "./DesktopNav";
import { Logo } from "./Logo";
import { MenuButton } from "./MenuButton";
import { MobileNav } from "./MobileNav";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { SavedTrigger } from "@/components/saved/SavedTrigger";

/**
 * Global site header — permanently transparent, on every page and at every
 * scroll position (no solid/frosted fill, per explicit feedback that a
 * background fill read as a heavy opaque bar once scrolled). Nav content
 * (everything but the logo and the filled CTA pill, which already carry
 * their own contrast) is white with `mix-blend-mode: difference` — see
 * `NavLink` for the full rationale — so it auto-inverts against whatever's
 * actually behind the header, including `MobileNav`'s own solid light sheet
 * once open, with no scroll-position or page-content tracking needed at all.
 *
 * Deliberately `position: fixed` with NO transform on itself (no
 * hide-on-scroll-down slide, no translate of any kind) — an earlier version
 * toggled `-translate-y-full`/`translate-y-0` to tuck the header away on a
 * sustained downward scroll, but a fixed element with its own animated
 * transform is a real, reproducible compositor bug on this stack: the
 * header's painted layer detaches from its actual position and renders
 * stale, torn, or overlapping page content when scrolling — worse, the
 * detachment could show up as the header appearing to slide into the
 * middle of the page instead of scrolling away cleanly. The header simply
 * stays put at the top.
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNavId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMobileNav() {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  }

  // Close the mobile panel automatically if the viewport grows past the
  // mobile breakpoint (e.g. rotating a tablet) so it can't get stuck open.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    function onChange() {
      if (mql.matches) setMobileOpen(false);
    }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-transparent">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <div className="flex items-center gap-4 lg:gap-6">
              <DesktopNav />
              <SearchTrigger variant="full" />
              <SearchTrigger variant="compact" />
              <SavedTrigger />
              <MenuButton
                ref={menuButtonRef}
                open={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                controlsId={mobileNavId}
              />
            </div>
          </div>
        </Container>
      </header>

      <MobileNav id={mobileNavId} open={mobileOpen} onClose={closeMobileNav} />
    </>
  );
}
