import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface MenuButtonProps {
  open: boolean;
  onClick: () => void;
  tone?: "default" | "inverted";
  controlsId: string;
}

/** Two-bar hamburger that morphs into an X — pure CSS transform, no icon swap. */
export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ open, onClick, tone = "default", controlsId }, ref) => {
    const barColor = tone === "inverted" ? "bg-white" : "bg-fg";

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
          className={cn(
            "absolute h-px w-6 transition-transform duration-200 ease-[var(--ease-standard)]",
            barColor,
            open ? "translate-y-0 rotate-45" : "-translate-y-[3px] rotate-0",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute h-px w-6 transition-transform duration-200 ease-[var(--ease-standard)]",
            barColor,
            open ? "translate-y-0 -rotate-45" : "translate-y-[3px] rotate-0",
          )}
        />
      </button>
    );
  },
);
MenuButton.displayName = "MenuButton";
