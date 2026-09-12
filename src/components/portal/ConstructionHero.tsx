"use client";

import { AnimatedNumber } from "@/components/portal/AnimatedNumber";
import { AnimatedProgressLine } from "@/components/portal/AnimatedProgressLine";

const SCOPE_LABEL: Record<"unit" | "floor" | "building" | "project", string> = {
  unit: "Your Unit Progress",
  floor: "Progress",
  building: "Progress",
  project: "Project Progress",
};

export interface ConstructionHeroProps {
  scopeLevel: "unit" | "floor" | "building" | "project";
  scopeLabel: string;
  progress: number | null;
  currentStageName?: string;
}

/**
 * Chapter 3 Prompt 4 §3/§4/§9/§25 — the construction hero. The label above
 * the percentage always names the real level the number represents (never
 * lets a project-wide figure read as "your unit's" completion) — the
 * single most important honesty rule in this whole page.
 */
export function ConstructionHero({ scopeLevel, scopeLabel, progress, currentStageName }: ConstructionHeroProps) {
  const heading = scopeLevel === "floor" || scopeLevel === "building" ? `${scopeLabel} ${SCOPE_LABEL[scopeLevel]}` : SCOPE_LABEL[scopeLevel];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-caption text-fg-subtle uppercase">{heading}</p>
        {progress === null ? (
          <p className="text-h3 text-fg-muted mt-2">Progress will appear here once construction begins.</p>
        ) : (
          <p className="text-display-xl text-fg mt-1">
            <AnimatedNumber value={progress} suffix="%" />
          </p>
        )}
      </div>

      {progress !== null && <AnimatedProgressLine percent={progress} />}

      {currentStageName && (
        <div>
          <p className="text-caption text-fg-subtle uppercase">Currently</p>
          <p className="text-h3 text-fg mt-1">{currentStageName}</p>
        </div>
      )}
    </div>
  );
}
