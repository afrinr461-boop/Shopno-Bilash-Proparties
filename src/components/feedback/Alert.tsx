import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/status";

export interface AlertProps {
  tone: Extract<StatusTone, "success" | "warning" | "error" | "info">;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const TONE_ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
} as const;

const TONE_CLASSES = {
  success: "bg-success-soft text-success border-success-soft",
  warning: "bg-warning-soft text-warning border-warning-soft",
  error: "bg-error-soft text-error border-error-soft",
  info: "bg-info-soft text-info border-info-soft",
} as const;

/** Inline banner for success/warning/error/info feedback (e.g. after a form submit). */
export function Alert({ tone, title, description, action, className }: AlertProps) {
  const Icon = TONE_ICON[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <Icon className="size-5 shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1">
        <p className="text-label">{title}</p>
        {description && <p className="text-body-sm mt-0.5 text-fg">{description}</p>}
      </div>
      {action}
    </div>
  );
}
