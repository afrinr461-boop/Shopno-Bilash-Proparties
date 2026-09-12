import { Check } from "lucide-react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PropertyMilestone {
  label: string;
  /** ISO date — omitted for a milestone that hasn't happened yet. */
  date?: string;
  state: "done" | "current" | "upcoming";
}

/**
 * Prompt 2 §18 — "only show meaningful milestones... do not create fake
 * dates." The caller is responsible for that: this component only ever
 * renders what it's given, never invents a step.
 */
export function PropertyTimeline({ milestones }: { milestones: PropertyMilestone[] }) {
  if (milestones.length === 0) return null;

  return (
    <ol className="flex flex-col">
      {milestones.map((milestone, i) => (
        <li key={milestone.label} className="relative flex gap-4 pb-6 last:pb-0">
          {i < milestones.length - 1 && (
            <span aria-hidden className={cn("absolute top-6 left-[11px] h-full w-px", milestone.state === "done" ? "bg-accent" : "bg-border")} />
          )}
          <span
            aria-hidden
            className={cn(
              "relative flex size-6 shrink-0 items-center justify-center rounded-full border transition-shadow",
              milestone.state === "done" && "bg-accent border-accent text-accent-foreground",
              milestone.state === "current" && "border-accent text-accent bg-surface-raised ring-4 ring-accent-soft",
              milestone.state === "upcoming" && "border-border text-fg-subtle bg-transparent",
            )}
          >
            {milestone.state === "done" ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <span className={cn("size-1.5 rounded-full", milestone.state === "current" ? "bg-accent" : "bg-border-strong")} />
            )}
          </span>
          <div className="pt-0.5">
            <p className={cn("text-body font-medium", milestone.state === "upcoming" ? "text-fg-subtle" : "text-fg")}>{milestone.label}</p>
            {milestone.date && <p className="text-caption text-fg-subtle mt-0.5">{formatDate(new Date(milestone.date))}</p>}
            {milestone.state === "current" && !milestone.date && <p className="text-caption text-accent mt-0.5">In progress</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
