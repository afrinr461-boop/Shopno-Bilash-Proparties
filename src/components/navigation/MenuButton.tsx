import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface MenuButtonProps {
  open: boolean;
  onClick: () => void;
  controlsId: string;
}

/**
 * Two-bar hamburger that morphs into an X — pure CSS transform, no icon
 * swap. Each bar is a solid white background with `mix-blend-mode:
 * difference` (see NavLink), so it inverts against whatever's behind the
 * permanently-transparent header — including `MobileNav`'s own solid light
 * sheet once open, which needs no special-casing as a result.
 */
export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ open, onClick, controlsId }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-expanded={open}
        aria-controls={controlsId}
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative flex size-11 shrink-0 items-center justify-center lg:hidden"
      >
        <span
          aria-hidden
          style={{ mixBlendMode: "difference" }}
          className={cn(
            // Slightly thicker than a hairline (1px looked washed out once
            // `mix-blend-mode` was inverting it — antialiased edge pixels
            // only get a partial-alpha difference, so a 1px line read
            // fainter than the same line painted with a flat color did).
            "absolute h-[1.5px] w-6 bg-white transition-transform duration-200 ease-[var(--ease-standard)]",
            open ? "translate-y-0 rotate-45" : "-translate-y-[3px] rotate-0",
          )}
        />
        <span
          aria-hidden
          style={{ mixBlendMode: "difference" }}
          className={cn(
            // Slightly thicker than a hairline (1px looked washed out once
            // `mix-blend-mode` was inverting it — antialiased edge pixels
            // only get a partial-alpha difference, so a 1px line read
            // fainter than the same line painted with a flat color did).
            "absolute h-[1.5px] w-6 bg-white transition-transform duration-200 ease-[var(--ease-standard)]",
            open ? "translate-y-0 -rotate-45" : "translate-y-[3px] rotate-0",
          )}
        />
      </button>
    );
  },
);
MenuButton.displayName = "MenuButton";
