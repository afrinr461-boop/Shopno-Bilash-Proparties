"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The same thin-line, fill-on-scroll progress treatment as the public
 * site's `ConstructionOverallProgress` — reused here rather than a new
 * dashboard-style bar, so the owner portal's construction number reads
 * with the same architectural restraint as the marketing site.
 */
export function AnimatedProgressLine({ percent }: { percent: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFilled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-border relative h-px w-full overflow-hidden">
      <div
        className="bg-accent absolute inset-y-0 left-0 transition-[width] duration-1000 ease-[var(--ease-standard)]"
        style={{ width: filled ? `${Math.max(0, Math.min(100, percent))}%` : "0%" }}
      />
    </div>
  );
}
