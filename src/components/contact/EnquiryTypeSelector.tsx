"use client";

import { useId } from "react";
import { ArchitecturalMotif } from "@/components/ui/ArchitecturalMotif";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { contactPaths } from "@/content/contact";

export interface EnquiryTypeSelectorProps {
  selected: string;
  onSelect: (value: string) => void;
  /** True once the visitor arrived with a type already implied by context — the selector still works, but says so instead of pretending it's a blank choice. */
  preSelected: boolean;
}

/**
 * The "why are you here" step (brief §4) — a numbered radiogroup, not a
 * checkbox list. The selected row gets a real state change (accent left
 * rule + tinted background + filled index), not just a color swap on text,
 * so "this one is picked" reads at a glance.
 */
export function EnquiryTypeSelector({ selected, onSelect, preSelected }: EnquiryTypeSelectorProps) {
  const groupId = useId();

  return (
    <div className="relative">
      <ArchitecturalMotif
        fit="cover"
        className="text-border pointer-events-none absolute -top-4 -right-6 hidden h-40 w-40 opacity-60 lg:block"
      />
      <Reveal as="p" className="text-label text-fg-subtle relative mb-2 uppercase">
        What can we help with?
      </Reveal>
      {preSelected && (
        <p className="text-body-sm text-fg-subtle relative mb-6">
          We&rsquo;ve pre-selected one based on where you came from — change it any time.
        </p>
      )}
      <div role="radiogroup" aria-labelledby={groupId} className={cn("relative", !preSelected && "mt-6")}>
        <span id={groupId} className="sr-only">
          Select the reason you&rsquo;re reaching out
        </span>
        <Divider />
        {contactPaths.map((path, i) => {
          const active = selected === path.value;
          return (
            <Reveal key={path.value} delay={i * 40}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(path.value)}
                className={cn(
                  "flex w-full flex-col gap-1.5 border-l-2 py-6 pl-5 text-left transition-[border-color,background-color,padding] duration-200 ease-[var(--ease-standard)]",
                  active
                    ? "border-accent bg-accent-soft/40 pl-6"
                    : "border-transparent hover:border-border-strong hover:pl-6",
                )}
              >
                <span className="flex items-center gap-4">
                  <span
                    className={cn(
                      "text-label flex size-6 shrink-0 items-center justify-center rounded-full tabular-nums transition-colors duration-200",
                      active ? "bg-accent text-accent-foreground" : "text-fg-subtle",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className={cn("text-h3 transition-colors duration-150", active ? "text-accent" : "text-fg")}>
                    {path.label}
                  </span>
                </span>
                <span className="text-body-sm text-fg-muted pl-10">{path.description}</span>
              </button>
              <Divider />
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
