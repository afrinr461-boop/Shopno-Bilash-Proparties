"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useSavedIds } from "@/hooks/useSavedProperties";

/**
 * Always white with `mix-blend-mode: difference` on the icon+hitbox only
 * (see NavLink) — the count badge is deliberately excluded from that blend
 * group (it's a plain sibling `<span>`, not wrapped by the blended element)
 * so it keeps its own fixed accent color instead of inverting with
 * whatever's behind the header.
 */
export function SavedTrigger() {
  const count = useSavedIds().length;

  return (
    <Link
      href="/saved"
      aria-label={count > 0 ? `Saved properties (${count})` : "Saved properties"}
      className="relative flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10"
    >
      <Heart aria-hidden style={{ mixBlendMode: "difference" }} className="size-5 text-white/90" />
      {count > 0 && (
        <span
          aria-hidden
          className="bg-accent text-accent-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
