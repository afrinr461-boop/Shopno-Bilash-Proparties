"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { MILESTONE_ICON_MAP } from "@/lib/milestoneIcons";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import type { CompanyMilestone } from "@/types/companyMilestone";

/** One "Our Story" timeline row: a themed icon badge on the connecting rail, and an inline "Read More" expand for the optional longer `details` text — no separate page/route needed for a couple of paragraphs. */
export function MilestoneEntry({ milestone, delay, isLast }: { milestone: CompanyMilestone; delay: number; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const { icon: Icon } = MILESTONE_ICON_MAP[milestone.icon];

  return (
    <Reveal delay={delay} className="relative flex gap-6 pb-12 last:pb-0 sm:gap-8">
      {!isLast && (
        <span aria-hidden className="bg-border absolute top-12 left-6 h-[calc(100%-1rem)] w-px sm:left-7" />
      )}
      <span
        aria-hidden
        className="bg-accent-soft text-accent border-border-strong relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border sm:size-14"
      >
        <Icon className="size-5 sm:size-6" />
      </span>

      <div className="min-w-0 flex-1 pt-1">
        <p className="text-label text-accent tabular-nums">{milestone.year}</p>
        <h3 className="text-h4 mt-1">{milestone.title}</h3>
        <p className="text-body text-fg-muted mt-2 max-w-lg">{milestone.summary}</p>

        {milestone.details && (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={detailsId}
              className="text-body-sm text-accent hover:text-accent-strong mt-3 flex items-center gap-1 font-medium transition-colors"
            >
              {open ? "Show Less" : "Read More"}
              <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
            </button>
            <div
              id={detailsId}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-[var(--ease-standard)]",
                open ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]",
              )}
            >
              <p className="text-body-sm text-fg-muted max-w-lg overflow-hidden">{milestone.details}</p>
            </div>
          </>
        )}
      </div>
    </Reveal>
  );
}
