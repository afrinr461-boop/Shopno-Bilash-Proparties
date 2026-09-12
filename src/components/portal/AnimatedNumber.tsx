"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 900;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Same count-up-on-scroll technique as the public site's `StatCounter`,
 * generalized (no fixed label/suffix layout) for reuse inside portal
 * cards. `prefix`/`suffix` are plain strings (not a formatter callback) so
 * a Server Component parent can pass this props safely — a function prop
 * can't cross that boundary. Grouping matches `lib/format.ts`'s `en-IN`
 * (lakh/crore) convention, the same one every BDT figure elsewhere uses.
 */
export function AnimatedNumber({ value, prefix, suffix }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          setDisplay(Math.round(value * easeOutCubic(progress)));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
