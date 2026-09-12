"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

const SIDE_CLASSES: Record<NonNullable<TooltipProps["side"]>, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
};

/**
 * Hover/focus-triggered label — for a collapsed sidebar's icon-only items,
 * or any icon-only control that needs a visible hint beyond its
 * `aria-label`. Shows on both mouse hover and keyboard focus so it's never
 * mouse-only information.
 */
export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "text-caption bg-fg text-bg pointer-events-none absolute z-50 rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-md transition-opacity duration-150",
          SIDE_CLASSES[side],
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        {label}
      </span>
    </span>
  );
}
