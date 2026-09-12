"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  PUBLIC_NAV_PRIMARY,
  PUBLIC_NAV_MORE,
  PUBLIC_NAV_FOUNDER,
  PUBLIC_PRIMARY_CTA,
} from "@/config/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { cn } from "@/lib/utils";

export interface MobileNavProps {
  id: string;
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled])';

export function MobileNav({ id, open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and move focus into the panel while open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const firstLink = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    firstLink?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      id={id}
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!open}
      inert={!open || undefined}
      className={cn(
        "bg-bg fixed inset-0 z-40 flex flex-col overflow-y-auto pt-24 pb-10 transition-opacity duration-300 ease-[var(--ease-standard)] lg:hidden",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <nav aria-label="Primary" className="flex flex-1 flex-col justify-center gap-2 px-6">
        {PUBLIC_NAV_PRIMARY.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "text-display-m reveal py-2 text-fg",
              open && "is-visible",
            )}
            style={{ transitionDelay: open ? `${80 + i * 60}ms` : undefined }}
          >
            {item.label}
          </Link>
        ))}

        <div
          className={cn("reveal py-6", open && "is-visible")}
          style={{ transitionDelay: open ? `${80 + PUBLIC_NAV_PRIMARY.length * 60}ms` : undefined }}
        >
          <Divider />
        </div>

        <div
          className={cn("reveal flex flex-col gap-3", open && "is-visible")}
          style={{
            transitionDelay: open
              ? `${120 + PUBLIC_NAV_PRIMARY.length * 60}ms`
              : undefined,
          }}
        >
          <Link
            href={PUBLIC_NAV_FOUNDER.href}
            onClick={onClose}
            className="text-h4 text-fg-muted hover:text-fg transition-colors"
          >
            {PUBLIC_NAV_FOUNDER.label}
          </Link>
          {PUBLIC_NAV_MORE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="text-h4 text-fg-muted hover:text-fg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div
        className={cn("reveal px-6", open && "is-visible")}
        style={{
          transitionDelay: open
            ? `${160 + (PUBLIC_NAV_PRIMARY.length + PUBLIC_NAV_MORE.length) * 40}ms`
            : undefined,
        }}
      >
        <Link
          href={PUBLIC_PRIMARY_CTA.href}
          onClick={onClose}
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          {PUBLIC_PRIMARY_CTA.label}
        </Link>
      </div>
    </div>
  );
}
