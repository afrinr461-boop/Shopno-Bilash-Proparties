"use client";

import { useEffect, useRef, useState } from "react";
import type { Statistic } from "@/content/home";

const DURATION_MS = 1200;

/** Eased 0→1 progress curve — quick start, gentle settle, never bouncy. */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function StatCounter({ label, value, suffix }: Statistic) {
  const ref = useRef<HTMLParagraphElement>(null);
  // Lazy initializer, not an effect: if motion is already off, start at the
  // final value directly instead of animating up to it.
  const [display, setDisplay] = useState(() =>
    value !== null && prefersReducedMotion() ? value : 0,
  );

  useEffect(() => {
    if (value === null || prefersReducedMotion()) return;
    const target = value;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          setDisplay(Math.round(target * easeOutCubic(progress)));
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
    <div>
      <p ref={ref} className="text-stat-lg text-accent">
        {value === null ? "—" : display.toLocaleString("en-US")}
        {value !== null && suffix}
      </p>
      <p className="text-body text-fg-muted mt-2">{label}</p>
    </div>
  );
}
