"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Bold, List } from "lucide-react";
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
 * A plain `<textarea>` plus "Bold" and "Bullet" toolbar buttons — the
 * entire rich-text surface this app needs (see `src/lib/richText.tsx`'s
 * `renderRichText` for how `**wrapped**` text and `- ` lines render on the
 * public side). Both buttons edit the DOM node directly (Bold wraps the
 * current selection in `**…**`; Bullet toggles a `- ` prefix on the
 * current line) rather than through React state, matching every other
 * admin form here: an uncontrolled `<textarea defaultValue>`, read via
 * `FormData` at submit time — so this still works as a plain `name="…"`
 * form field with no extra wiring. A plain `<textarea>` already supports
 * multi-line text with the Enter key on its own — no Shift+Enter needed.
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

    function toggleBullet() {
      const el = innerRef.current;
      if (!el) return;
      const { selectionStart, value } = el;
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const alreadyBullet = value.slice(lineStart, lineStart + 2) === "- ";

      el.value = alreadyBullet
        ? value.slice(0, lineStart) + value.slice(lineStart + 2)
        : `${value.slice(0, lineStart)}- ${value.slice(lineStart)}`;
      el.focus();
      const shift = alreadyBullet ? -2 : 2;
      el.setSelectionRange(selectionStart + shift, selectionStart + shift);
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-label text-fg-muted">
            {label}
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleBold}
              aria-label="Bold the selected text"
              title="Select some text first, then click to bold it"
              className="border-border-strong text-fg-muted hover:border-fg-subtle hover:text-fg flex size-6 items-center justify-center rounded border transition-colors"
            >
              <Bold aria-hidden className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleBullet}
              aria-label="Turn the current line into a bullet point"
              title="Click to turn the current line into a bullet point (click again to undo)"
              className="border-border-strong text-fg-muted hover:border-fg-subtle hover:text-fg flex size-6 items-center justify-center rounded border transition-colors"
            >
              <List aria-hidden className="size-3.5" />
            </button>
          </div>
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
          {error || helperText || "Select text and press Bold, or click List to bullet the current line — both show up on the public page. Press Enter for a new line, leave a blank line for a new paragraph."}
        </p>
      </div>
    );
  },
);
RichTextArea.displayName = "RichTextArea";
