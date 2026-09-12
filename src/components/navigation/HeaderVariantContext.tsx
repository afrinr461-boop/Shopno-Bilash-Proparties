"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";

// Avoids the "useLayoutEffect does nothing on the server" warning — this
// file is client-only, but Next still renders it once during SSR.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type HeaderVariant = "solid" | "overlay";

interface HeaderVariantContextValue {
  variant: HeaderVariant;
  setVariant: (variant: HeaderVariant) => void;
}

const HeaderVariantContext = createContext<HeaderVariantContextValue | null>(null);

/**
 * Lets an individual page (rendered inside the shared PublicLayout, below
 * the Header) declare how the header should look on that page — e.g. a
 * future full-bleed Hero page requesting "overlay" — without the Header or
 * layout needing to hard-code per-route logic (Step 3 brief §5).
 */
export function HeaderVariantProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<HeaderVariant>("solid");
  return (
    <HeaderVariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </HeaderVariantContext.Provider>
  );
}

function useHeaderVariantContext() {
  const ctx = useContext(HeaderVariantContext);
  if (!ctx) {
    throw new Error("useHeaderVariantContext must be used within HeaderVariantProvider");
  }
  return ctx;
}

/** Read by <Header> and the page-content padding wrapper. */
export function useHeaderVariant() {
  return useHeaderVariantContext().variant;
}

/**
 * Call from a page component to switch the shared header into that mode
 * for as long as the page is mounted; resets to "solid" automatically on
 * navigation away.
 */
export function usePageHeaderVariant(variant: HeaderVariant) {
  const { setVariant } = useHeaderVariantContext();
  // Layout effect (not a plain effect) so the header/page-padding switch
  // happens before the browser paints the hydrated page — otherwise a
  // hero page briefly flashes the default "solid" header treatment.
  useIsomorphicLayoutEffect(() => {
    setVariant(variant);
    return () => setVariant("solid");
  }, [variant, setVariant]);
}
