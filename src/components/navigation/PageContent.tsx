"use client";

import type { ReactNode } from "react";
import { PageTransition } from "@/components/ui/PageTransition";
import { cn } from "@/lib/utils";
import { useHeaderVariant } from "./HeaderVariantContext";

/**
 * Reserves space under the fixed header for normal ("solid") pages. Pages
 * that opt into `usePageHeaderVariant("overlay")` for a full-bleed hero get
 * no top padding — their hero is meant to sit behind the transparent header.
 * Also the one place the route-change entrance transition is applied, so
 * individual pages never need to wire that up themselves.
 */
export function PageContent({ children }: { children: ReactNode }) {
  const variant = useHeaderVariant();

  return (
    <main className={cn("flex-1", variant === "solid" && "pt-16")}>
      <PageTransition>{children}</PageTransition>
    </main>
  );
}
