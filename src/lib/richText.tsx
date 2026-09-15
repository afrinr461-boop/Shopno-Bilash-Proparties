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

/**
 * One step up from `renderBoldMarkup`, for text that needs paragraphs and
 * bullet lists too (e.g. Company Policy rule bodies) — still just two more
 * conventions on top of `**bold**`, not a real markdown parser: a line
 * starting with `- ` joins a bullet list, a blank line starts a new
 * paragraph, anything else is just a line (joined with the rest of its
 * paragraph by a line break).
 */
export function renderRichText(text: string): ReactNode {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let paraBuffer: string[] = [];
  let blockKey = 0;

  function flushBullets() {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${blockKey++}`} className="flex list-disc flex-col gap-1 pl-5">
        {bulletBuffer.map((line, i) => (
          <li key={i}>{renderBoldMarkup(line)}</li>
        ))}
      </ul>,
    );
    bulletBuffer = [];
  }

  function flushParagraph() {
    if (paraBuffer.length === 0) return;
    blocks.push(
      <p key={`p-${blockKey++}`}>
        {paraBuffer.map((line, i) => (
          <span key={i}>
            {renderBoldMarkup(line)}
            {i < paraBuffer.length - 1 && <br />}
          </span>
        ))}
      </p>,
    );
    paraBuffer = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      flushParagraph();
      bulletBuffer.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushBullets();
      flushParagraph();
    } else {
      flushBullets();
      paraBuffer.push(line);
    }
  }
  flushBullets();
  flushParagraph();

  return <>{blocks}</>;
}
