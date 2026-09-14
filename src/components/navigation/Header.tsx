"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { DesktopNav } from "./DesktopNav";
import { Logo } from "./Logo";
import { MenuButton } from "./MenuButton";
import { MobileNav } from "./MobileNav";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { SavedTrigger } from "@/components/saved/SavedTrigger";

/**
 * Global site header — permanently transparent, on every page and at every
 * scroll position (no solid/frosted fill, per explicit feedback that a
 * background fill read as a heavy opaque bar once scrolled). Nav content is
 * always the light "inverted" tone with a soft dark drop-shadow instead: a
 * fixed white-on-shadow treatment reads over both light and dark page
 * content without needing to track what's actually behind the header, which
 * a background-color swap would.
 *
 * The one exception is the mobile panel: `MobileNav` itself is a solid
 * light (`bg-bg`) full-screen sheet, so the header switches to the normal
 * dark tone (no shadow needed) while it's open, matching that opaque
 * surface instead of the page behind it.
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

  const tone: "default" | "inverted" = mobileOpen ? "default" : "inverted";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-transparent">
        <Container>
          <div
            className={cn(
              "flex h-16 items-center justify-between",
              // The drop-shadow (not a solid fill) is what keeps the always-
              // light nav content readable over arbitrary page content —
              // skipped while the mobile panel's own solid sheet is open,
              // since dark-on-light needs no shadow crutch there.
              !mobileOpen && "drop-shadow-[0_1px_3px_rgb(0_0_0_/_0.45)]",
            )}
          >
            <Logo tone={tone} />
            <div className="flex items-center gap-4 lg:gap-6">
              <DesktopNav tone={tone} />
              <SearchTrigger tone={tone} variant="full" />
              <SearchTrigger tone={tone} variant="compact" />
              <SavedTrigger tone={tone} />
              <MenuButton
                ref={menuButtonRef}
                open={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                tone={tone}
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
