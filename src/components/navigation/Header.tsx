"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { DesktopNav } from "./DesktopNav";
import { useHeaderVariant } from "./HeaderVariantContext";
import { Logo } from "./Logo";
import { MenuButton } from "./MenuButton";
import { MobileNav } from "./MobileNav";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { SavedTrigger } from "@/components/saved/SavedTrigger";

const SCROLL_SOLIDIFY_AT = 8;

/**
 * Global site header. Its light/transparent-vs-solid treatment is driven by
 * `useHeaderVariant()` (see HeaderVariantContext) so an individual page can
 * opt into the transparent "overlay" mode without the header hard-coding
 * per-route logic.
 *
 * Deliberately `position: fixed` with NO transform on itself (no
 * hide-on-scroll-down slide, no translate of any kind) — an earlier version
 * toggled `-translate-y-full`/`translate-y-0` to tuck the header away on a
 * sustained downward scroll, but a fixed element with its own animated
 * transform is a real, reproducible compositor bug on this stack: the
 * header's painted layer detaches from its actual position and renders
 * stale, torn, or overlapping page content when scrolling — worse, the
 * detachment could show up as the header appearing to slide into the
 * middle of the page instead of scrolling away cleanly. Background/border/
 * shadow can still transition (only paint properties, no transform), which
 * doesn't trigger the same bug. The header simply stays put at the top.
 */
export function Header() {
  const variant = useHeaderVariant();
  const [scrolled, setScrolled] = useState(false);
  // Whether we've scrolled past the overlay hero's own ~100svh height —
  // beyond that point the header sits over ordinary (often light) content,
  // not the hero image/panel, so it must fall back to the normal solid
  // treatment instead of staying "frosted" for the rest of the page.
  const [pastHero, setPastHero] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNavId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMobileNav() {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  }

  useEffect(() => {
    let ticking = false;

    function update() {
      const y = window.scrollY;
      setScrolled(y > SCROLL_SOLIDIFY_AT);
      setPastHero(y > window.innerHeight - 96);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    // Sync immediately with wherever the page actually is on mount — the
    // browser can restore a non-zero scroll position on reload/back-nav
    // before this effect ever sees a real "scroll" event, which otherwise
    // left the header rendered for the top of the page (transparent/tall)
    // while the content underneath was already scrolled — a visible
    // mismatch until the next scroll happened to fire.
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const isOverlay = variant === "overlay";
  // Three states, not two: fully transparent (top of a hero), a frosted
  // dark glass while still over the hero itself (still see-through +
  // blurred — never a flat opaque bar over the hero image), or the normal
  // solid treatment once scrolled past the hero into ordinary page content
  // (which is often light) — for pages with no hero, or while the mobile
  // panel is open.
  const frosted = isOverlay && scrolled && !pastHero && !mobileOpen;
  const lightSolid = !isOverlay || pastHero || mobileOpen;
  const tone: "default" | "inverted" = lightSolid ? "default" : "inverted";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ease-[var(--ease-standard)]",
          lightSolid && "bg-bg/70 border-b border-border shadow-sm backdrop-blur-xl",
          frosted && "bg-fg/20 border-b border-white/10 backdrop-blur-xl",
          !lightSolid && !frosted && "border-b border-transparent bg-transparent",
        )}
      >
        <Container>
          <div
            className={cn(
              "flex items-center justify-between transition-[height] duration-300 ease-[var(--ease-standard)]",
              isOverlay && !scrolled && !mobileOpen ? "h-24" : "h-16",
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
