"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface NavigationGroupProps {
  label: string;
  items: NavItem[];
  tone?: "default" | "inverted";
}

/**
 * "More" disclosure for secondary public-nav items — a labelled button that
 * reveals a small link panel, closes on outside click / Escape / item
 * selection, and restores focus to the trigger on close.
 */
export function NavigationGroup({ label, items, tone = "default" }: NavigationGroupProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const textTone =
    tone === "inverted"
      ? "text-white/80 hover:text-white"
      : "text-fg-muted hover:text-fg";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "text-nav inline-flex items-center gap-1 py-1 transition-colors duration-150",
          textTone,
        )}
      >
        {label}
        <ChevronDown
          aria-hidden
          className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <div
        id={panelId}
        role="group"
        aria-label={label}
        className={cn(
          "absolute left-1/2 top-full z-10 mt-3 w-56 -translate-x-1/2 origin-top rounded-md border border-border bg-surface-raised p-2 shadow-float transition-[opacity,transform] duration-150 ease-[var(--ease-standard)]",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="text-body-sm block rounded-sm px-3 py-2 text-fg-muted transition-colors duration-150 hover:bg-surface hover:text-fg"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
