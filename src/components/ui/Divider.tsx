import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: "horizontal" | "vertical";
  tone?: "default" | "strong";
}

/** Hairline separator. Prefer this over an ad-hoc `border-t` on a random element. */
export function Divider({
  className,
  orientation = "horizontal",
  tone = "default",
  ...props
}: DividerProps) {
  const borderColor = tone === "strong" ? "border-border-strong" : "border-border";

  return (
    <hr
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "m-0 border-0",
        orientation === "horizontal"
          ? cn("w-full border-t", borderColor)
          : cn("h-full border-l", borderColor),
        className,
      )}
      {...props}
    />
  );
}
