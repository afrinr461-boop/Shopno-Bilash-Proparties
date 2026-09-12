import { UNIT_STATUS_LABEL, UNIT_STATUS_TONE, type UnitStatus } from "@/content/units";
import { cn } from "@/lib/utils";

export interface UnitStatusTagProps {
  status: UnitStatus;
  className?: string;
}

/** Same restrained dot + label treatment as <ProjectStatus> — never a loud colored pill. */
export function UnitStatusTag({ status, className }: UnitStatusTagProps) {
  return (
    <span className={cn("text-label text-fg-muted inline-flex items-center gap-2", className)}>
      <span className={cn("size-1.5 rounded-full", UNIT_STATUS_TONE[status])} aria-hidden />
      {UNIT_STATUS_LABEL[status]}
    </span>
  );
}
