import { PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE, type ProjectStatus } from "@/content/projects";
import { cn } from "@/lib/utils";

export interface ProjectStatusProps {
  status: ProjectStatus;
  className?: string;
}

/**
 * Deliberately the opposite of the admin `StatusBadge` (icon + colored
 * pill) — a project's status here is a supporting detail, not the headline,
 * so it's a small dot and plain text. Understandable without dominating
 * the composition (brief §5).
 */
export function ProjectStatus({ status, className }: ProjectStatusProps) {
  return (
    <span className={cn("text-label text-fg-muted inline-flex items-center gap-2", className)}>
      <span className={cn("size-1.5 rounded-full", PROJECT_STATUS_TONE[status])} aria-hidden />
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}
