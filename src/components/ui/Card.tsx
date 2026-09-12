import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("bg-surface-raised", {
  variants: {
    variant: {
      /** Default bordered surface — most info-dense UI (stats, forms, list rows). */
      default: "rounded-lg border border-border p-6 shadow-sm",
      /** No border/shadow — for content already separated by whitespace on a plain background. */
      plain: "rounded-lg p-6",
      /** Image/media-led editorial card — no padding, content composes its own overlay. */
      media: "rounded-lg overflow-hidden",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/**
 * Base surface primitive. Reach for `plain`/`media` before `default` when
 * the layout is editorial — not every future card needs an identical
 * bordered-rounded-rectangle treatment (see DESIGN_SYSTEM.md §8).
 */
export function Card({ className, variant, children, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}
