"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import type { ConstructionProgress } from "@/content/construction";

/**
 * A large number + a thin architectural progress line — not a circular
 * gauge or a dashboard bar. Omits itself entirely when no real percentage
 * exists, rather than showing a placeholder figure.
 */
export function ConstructionOverallProgress({ progress }: { progress: ConstructionProgress }) {
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

  if (progress.overallProgress === undefined) return null;

  return (
    <Section spacing="md" background="surface">
      <Container>
        <div ref={ref}>
          <p className="text-label text-fg-subtle mb-6 uppercase">Construction Progress</p>
          <p className="text-stat-xl text-accent">{progress.overallProgress}%</p>

          <div className="bg-border relative mt-8 h-px w-full max-w-2xl overflow-hidden">
            <div
              className="bg-accent absolute inset-y-0 left-0 transition-[width] duration-1000 ease-[var(--ease-standard)]"
              style={{ width: filled ? `${progress.overallProgress}%` : "0%" }}
            />
          </div>

          {progress.currentPhase && (
            <p className="text-body text-fg-muted mt-6">
              Current phase: <span className="text-fg">{progress.currentPhase}</span>
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
