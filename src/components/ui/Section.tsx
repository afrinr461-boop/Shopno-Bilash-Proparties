import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Vertical rhythm only — pair with <Container> inside for horizontal gutters. */
  spacing?: "sm" | "md" | "lg";
  background?: "bg" | "surface" | "transparent";
  as?: ElementType;
}

const SPACING_VAR = {
  sm: "var(--space-section-sm)",
  md: "var(--space-section)",
  lg: "var(--space-section-lg)",
} as const;

const BACKGROUND_CLASSES = {
  bg: "bg-bg",
  surface: "bg-surface",
  transparent: "",
} as const;

/**
 * Vertical rhythm primitive. Every full-bleed page section should be a
 * <Section>, not a manually-chosen py-* value — this is what keeps the
 * whitespace between sections consistent across the whole site.
 */
export function Section({
  className,
  spacing = "md",
  background = "transparent",
  as: Tag = "section",
  style,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(BACKGROUND_CLASSES[background], className)}
      style={{
        paddingTop: SPACING_VAR[spacing],
        paddingBottom: SPACING_VAR[spacing],
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
