"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NavLinkProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  children: ReactNode;
  /**
   * "default" reads with the normal fg tokens (light theme). "inverted" is
   * fixed light-on-dark, for the header while it's reading over a dark
   * section — see `Header`'s `data-header-tone` detection for how this is
   * decided; `mix-blend-mode` was tried first but doesn't actually work
   * here (a `position: fixed` header is its own stacking context, so a
   * blend mode on its children can't see page content scrolling behind it
   * at all — the text just stayed a flat, unchanging white).
   */
  tone?: "default" | "inverted";
}

/**
 * Primitive for the header's nav — underline grows from the left on
 * hover/active rather than a background fill or color-only change, so it
 * reads as a precise architectural detail rather than a generic app tab.
 */
export function NavLink({ className, children, href, tone = "default", ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "text-nav relative py-1 transition-colors duration-150",
        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:transition-transform after:duration-200 after:ease-[var(--ease-standard)]",
        "hover:after:scale-x-100",
        isActive && "after:scale-x-100",
        tone === "inverted"
          ? cn("text-white/80 after:bg-white hover:text-white", isActive && "text-white")
          : cn("text-fg-muted after:bg-fg hover:text-fg", isActive && "text-fg"),
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
