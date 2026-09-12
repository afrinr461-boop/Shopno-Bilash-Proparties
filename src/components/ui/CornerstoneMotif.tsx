export interface CornerstoneMotifProps {
  className?: string;
}

const STRATA = [
  { y1: 58, y2: 56 },
  { y1: 96, y2: 99 },
  { y1: 134, y2: 130 },
  { y1: 172, y2: 176 },
  { y1: 210, y2: 207 },
];

/**
 * A founding stone — a single hand-hewn block with layered strata lines
 * (years built up, one on another) and a small carved founding mark.
 * Built for "The Journey" section: a literal cornerstone for an origin
 * story, standing in for a supporting photo when none has been uploaded.
 * Not used anywhere else on the site. Draws in via `.draw-line`/
 * `.draw-fade` once inside a visible `<Reveal>`, same convention as the
 * rest of the `components/ui` motif family.
 */
export function CornerstoneMotif({ className }: CornerstoneMotifProps) {
  return (
    <svg aria-hidden viewBox="0 0 260 280" fill="none" className={className}>
      <path
        d="M28 42 L232 30 L242 246 L20 260 Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        pathLength={100}
        className="draw-line"
      />

      {STRATA.map((s, i) => (
        <line
          key={s.y1}
          x1="26"
          y1={s.y1}
          x2="236"
          y2={s.y2}
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.4"
          pathLength={100}
          className="draw-line"
          style={{ animationDelay: `${180 + i * 110}ms` }}
        />
      ))}

      <path
        d="M130 186 L146 204 L130 222 L114 204 Z"
        stroke="currentColor"
        strokeWidth="1"
        className="draw-fade"
        style={{ animationDelay: "860ms" }}
      />
      <circle cx="130" cy="204" r="3" fill="currentColor" className="draw-fade" style={{ animationDelay: "1000ms" }} />

      <path d="M28 42 L44 49" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M232 30 L221 44" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
