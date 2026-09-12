import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors duration-150 ease-[var(--ease-standard)] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        ghost: "text-fg-muted hover:bg-surface hover:text-fg",
        outline: "text-fg-muted border border-border-strong hover:bg-surface hover:text-fg",
      },
      size: {
        sm: "size-8",
        md: "size-10",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: LucideIcon;
  /** Required, not optional — an icon-only button with no accessible name is a dead end for screen readers. */
  label: string;
}

/** Icon-only action button (header actions, table row actions) — always carries an `aria-label`, never relies on a visible label. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, label, variant, size, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      <Icon aria-hidden className={size === "sm" ? "size-4" : "size-4.5"} />
    </button>
  ),
);
IconButton.displayName = "IconButton";
