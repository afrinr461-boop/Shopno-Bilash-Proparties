"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface PinInputProps {
  name: string;
  label: string;
  autoFocus?: boolean;
  className?: string;
}

const LENGTH = 4;

/**
 * Four separate boxes that behave as one field — the value is assembled
 * into a single hidden `<input name={name}>` on every keystroke, so the
 * server action still just reads one plain string field, no client-side
 * state management needed beyond DOM refs.
 */
export function PinInput({ name, label, autoFocus, className }: PinInputProps) {
  const boxRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hiddenRef = useRef<HTMLInputElement>(null);

  function syncHidden() {
    if (hiddenRef.current) {
      hiddenRef.current.value = boxRefs.current.map((el) => el?.value ?? "").join("");
    }
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const el = boxRefs.current[index];
    if (el) el.value = digit;
    syncHidden();
    if (digit && index < LENGTH - 1) boxRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !boxRefs.current[index]?.value && index > 0) {
      boxRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!digits) return;
    e.preventDefault();
    digits.split("").forEach((digit, i) => {
      const el = boxRefs.current[i];
      if (el) el.value = digit;
    });
    syncHidden();
    boxRefs.current[Math.min(digits.length, LENGTH - 1)]?.focus();
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-label text-fg-muted">{label}</span>
      <input ref={hiddenRef} type="hidden" name={name} />
      <div className="flex gap-3">
        {Array.from({ length: LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              boxRefs.current[i] = el;
            }}
            type="password"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            autoFocus={autoFocus && i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="text-h2 border-border-strong bg-surface-raised text-fg focus:border-accent focus:ring-accent-soft size-14 rounded-lg border text-center outline-none transition-colors focus:ring-2"
            aria-label={`${label} digit ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
