import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * The one preview-card shape for every "connects to a later module" tile
 * across the owner portal (Payment Status, Construction, Documents, …) —
 * originally the Home dashboard's own local component, extracted here so
 * "My Property" (Prompt 2) can show the same compact previews, scoped to
 * one property, without a second copy of the card chrome.
 */
export function PreviewCard({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="border-border bg-surface-raised hover:border-fg-subtle group flex flex-col gap-3 rounded-2xl border p-6 shadow-sm transition-all duration-300 ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:shadow-lg"
    >
      {children}
    </Link>
  );
}

export function PreviewCardHeader({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-label text-fg-subtle flex items-center gap-2 uppercase">
        <Icon aria-hidden className="size-4" />
        {label}
      </span>
      <ArrowRight aria-hidden className="text-fg-subtle size-4 shrink-0 transition-transform group-hover:translate-x-1" />
    </div>
  );
}
