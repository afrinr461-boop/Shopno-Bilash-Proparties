import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "narrow" | "content" | "wide";
}

const SIZE_CLASSES = {
  narrow: "max-w-container-narrow",
  content: "max-w-container-content",
  wide: "max-w-container-wide",
} as const;

/** Centers content and applies the platform's responsive side padding (`--gutter`). */
export function Container({
  className,
  size = "content",
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full", SIZE_CLASSES[size], className)}
      style={{ paddingLeft: "var(--gutter)", paddingRight: "var(--gutter)" }}
      {...props}
    >
      {children}
    </div>
  );
}
