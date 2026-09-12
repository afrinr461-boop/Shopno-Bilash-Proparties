"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useSavedIds } from "@/hooks/useSavedProperties";
import { cn } from "@/lib/utils";

export function SavedTrigger({ tone = "default" }: { tone?: "default" | "inverted" }) {
  const count = useSavedIds().length;
  const inverted = tone === "inverted";

  return (
    <Link
      href="/saved"
      aria-label={count > 0 ? `Saved properties (${count})` : "Saved properties"}
      className={cn(
        "relative flex size-10 items-center justify-center rounded-md transition-colors",
        inverted ? "text-white/90 hover:bg-white/10" : "text-fg-muted hover:bg-surface hover:text-fg",
      )}
    >
      <Heart aria-hidden className="size-5" />
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
