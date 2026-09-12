import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  className?: string;
  /** Overrides the default accent fill — e.g. "bg-error" when a delayed phase should read as a warning even mid-progress. */
  fillClassName?: string;
}

/** A plain filled bar — replaces the bare `${n}%` text every construction view rendered before Chapter 2 Prompt 5. */
export function ProgressBar({ value, className, fillClassName }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-surface h-2 w-full min-w-16 flex-1 overflow-hidden rounded-full">
        <div
          className={cn("h-full rounded-full transition-[width]", fillClassName ?? "bg-accent")}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-caption text-fg-muted w-9 shrink-0 text-right tabular-nums">{clamped}%</span>
    </div>
  );
}
