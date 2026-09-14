"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Bold } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RichTextAreaProps {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  helperText?: string;
  error?: string;
}

/**
 * A plain `<textarea>` plus one "Bold" toolbar button — the entire
 * rich-text surface this app needs (see `src/lib/richText.tsx` for how
 * `**wrapped**` text renders bold on the public side). Wraps the current
 * selection in `**…**` directly on the DOM node (inserting an empty pair
 * at the caret with nothing selected) rather than through React state,
 * matching every other admin form here: an uncontrolled
 * `<textarea defaultValue>`, read via `FormData` at submit time — so this
 * still works as a plain `name="…"` form field with no extra wiring.
 */
export const RichTextArea = forwardRef<HTMLTextAreaElement, RichTextAreaProps>(
  ({ label, name, defaultValue, required, rows = 4, placeholder, helperText, error }, forwardedRef) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement);
    const id = `richtext-${name}`;
    const messageId = `${id}-message`;

    function toggleBold() {
      const el = innerRef.current;
      if (!el) return;
      const { selectionStart, selectionEnd, value } = el;
      const selected = value.slice(selectionStart, selectionEnd);

      el.value = `${value.slice(0, selectionStart)}**${selected}**${value.slice(selectionEnd)}`;
      el.focus();
      el.setSelectionRange(selectionStart + 2, selectionStart + 2 + selected.length);
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-label text-fg-muted">
            {label}
          </label>
          <button
            type="button"
            onClick={toggleBold}
            aria-label="Bold the selected text"
            title="Select some text first, then click to bold it"
            className="border-border-strong text-fg-muted hover:border-fg-subtle hover:text-fg flex size-6 items-center justify-center rounded border transition-colors"
          >
            <Bold aria-hidden className="size-3.5" />
          </button>
        </div>
        <textarea
          ref={innerRef}
          id={id}
          name={name}
          rows={rows}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-invalid={!!error || undefined}
          aria-describedby={messageId}
          className={cn(
            "text-body resize-y rounded-md border border-border-strong bg-surface-raised px-3.5 py-3 text-fg outline-none transition-colors duration-150",
            "placeholder:text-fg-subtle",
            "focus:border-accent focus:ring-2 focus:ring-accent-soft",
            error && "border-error focus:border-error focus:ring-error-soft",
          )}
        />
        <p id={messageId} className={cn("text-body-sm", error ? "text-error" : "text-fg-subtle")}>
          {error || helperText || "Select text and press Bold — it'll show bold on the public page."}
        </p>
      </div>
    );
  },
);
RichTextArea.displayName = "RichTextArea";
