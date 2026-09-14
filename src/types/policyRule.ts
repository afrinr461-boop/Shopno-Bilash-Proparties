import type { AuditFields, ID } from "./common";

export interface PolicyRule extends AuditFields {
  id: ID;
  /**
   * The rule's own text. Plain text, with one lightweight markup
   * convention: `**wrapped like this**` renders bold on the public page
   * (see `src/lib/richText.tsx`) — the only formatting this needs, so a
   * full rich-text editor would be overkill.
   */
  text: string;
}
