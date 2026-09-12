export interface DocumentStackProps {
  className?: string;
}

/**
 * A different motif for the legal pages (Privacy/Terms/Disclaimer/Cookie
 * Policy) — a small fanned stack of document sheets, each with a folded
 * corner and a few text-line strokes, rather than reaching for another
 * architectural building/skyline. Same `pathLength={100}` + `.draw-line`/
 * `.draw-fade` convention as the rest of the motif family so it plays
 * once inside a visible `<Reveal>`.
 */
export function DocumentStack({ className }: DocumentStackProps) {
  return (
    <svg aria-hidden viewBox="0 0 400 300" fill="none" className={className}>
      {/* Back sheet, slightly rotated */}
      <g transform="rotate(-6 200 150)">
        <rect
          x="130"
          y="60"
          width="180"
          height="220"
          pathLength={100}
          stroke="currentColor"
          strokeWidth="1"
          className="draw-line"
        />
      </g>

      {/* Middle sheet */}
      <g transform="rotate(4 200 150)">
        <rect
          x="120"
          y="55"
          width="180"
          height="220"
          pathLength={100}
          stroke="currentColor"
          strokeWidth="1.25"
          className="draw-line"
          style={{ animationDelay: "160ms" }}
        />
      </g>

      {/* Front sheet with folded corner */}
      <path
        d="M110,50 H280 V240 L250,270 H110 Z"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.5"
        className="draw-line"
        style={{ animationDelay: "320ms" }}
      />
      <path
        d="M250,240 H280 L250,270 Z"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.25"
        className="draw-line"
        style={{ animationDelay: "480ms" }}
      />

      {/* Text-line strokes on the front sheet */}
      <line x1="130" y1="90" x2="230" y2="90" stroke="currentColor" strokeWidth="1.25" className="draw-fade" style={{ animationDelay: "620ms" }} />
      <line x1="130" y1="112" x2="260" y2="112" stroke="currentColor" strokeWidth="1" className="draw-fade" style={{ animationDelay: "680ms" }} />
      <line x1="130" y1="134" x2="245" y2="134" stroke="currentColor" strokeWidth="1" className="draw-fade" style={{ animationDelay: "740ms" }} />
      <line x1="130" y1="156" x2="225" y2="156" stroke="currentColor" strokeWidth="1" className="draw-fade" style={{ animationDelay: "800ms" }} />

      {/* A small verifying seal, bottom-right */}
      <circle
        cx="260"
        cy="200"
        r="26"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
        className="draw-line"
        style={{ animationDelay: "900ms" }}
      />
      <path
        d="M248,200 L257,209 L273,190"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.5"
        className="draw-line"
        style={{ animationDelay: "1050ms" }}
      />
    </svg>
  );
}
