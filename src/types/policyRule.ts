import type { AuditFields, ID } from "./common";

export interface PolicyRule extends AuditFields {
  id: ID;
  /** Short heading for this rule, e.g. "Pricing" or "Cancellations" — shown above its text on both the admin list and the public page. */
  title: string;
  /**
   * The rule's own detailed text. Plain text, with two lightweight markup
   * conventions (see `src/lib/richText.tsx`'s `renderRichText`):
   * `**wrapped like this**` renders bold, and a line starting with `- `
   * renders as a bullet point. A blank line starts a new paragraph. No
   * full rich-text editor — this is the only formatting a policy page
   * needs.
   */
  text: string;
}
