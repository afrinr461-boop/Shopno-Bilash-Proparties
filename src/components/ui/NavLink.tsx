"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NavLinkProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  children: ReactNode;
}

/**
 * Primitive for the header's nav — underline grows from the left on
 * hover/active rather than a background fill or color-only change, so it
 * reads as a precise architectural detail rather than a generic app tab.
 *
 * Always rendered white with `mix-blend-mode: difference` against whatever
 * is actually behind the (permanently transparent) header — the browser
 * inverts per-pixel, so the same link reads dark over light page content
 * and light over a dark hero/image without any scroll-position or
 * page-content tracking. `text-white/80` still works under `difference`
 * (partial alpha blends toward the backdrop's own color first), it just
 * reads as a slightly softer invert than the full-strength active state.
 */
export function NavLink({ className, children, href, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "text-nav relative py-1 text-white/80 transition-colors duration-150 hover:text-white",
        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-200 after:ease-[var(--ease-standard)]",
        "hover:after:scale-x-100",
        isActive && "text-white after:scale-x-100",
        className,
      )}
      style={{ mixBlendMode: "difference" }}
      {...props}
    >
      {children}
    </Link>
  );
}
