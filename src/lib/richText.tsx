import type { ReactNode } from "react";

/**
 * The one formatting convention this app supports outside a full rich-text
 * editor: `**wrapped text**` renders bold. Deliberately minimal — a real
 * WYSIWYG/markdown editor is more machinery than a handful of policy rules
 * ever need, and this still gives admins the one thing they actually asked
 * for (making a specific phrase stand out) without a new dependency.
 */
const BOLD_PATTERN = /\*\*(.+?)\*\*/g;

/** Splits `text` on `**bold**` spans and returns the equivalent React nodes (`<strong>` for matches, plain strings otherwise). Unmatched/odd `**` is left as literal text rather than throwing. */
export function renderBoldMarkup(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(BOLD_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));
    nodes.push(<strong key={key++}>{match[1]}</strong>);
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes;
}
