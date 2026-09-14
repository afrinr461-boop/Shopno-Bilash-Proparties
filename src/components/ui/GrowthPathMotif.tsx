export interface GrowthPathMotifProps {
  className?: string;
}

const MARKERS = [
  { x: 40, y: 260 },
  { x: 110, y: 205 },
  { x: 185, y: 220 },
  { x: 255, y: 130 },
  { x: 330, y: 70 },
];

/**
 * "Our Story"'s own motif — a single ascending path with a marker at each
 * turn, echoing the timeline's year-by-year shape (a journey, not a static
 * image) without literally repeating another section's skyline/blueprint
 * visual. Draws in via `.draw-line` (globals.css) — the same reveal
 * mechanism every other motif in this app uses, so it costs nothing extra
 * (no animation library, fires once via the existing IntersectionObserver).
 */
export function GrowthPathMotif({ className }: GrowthPathMotifProps) {
  const pathD = `M ${MARKERS.map((m) => `${m.x} ${m.y}`).join(" L ")}`;

  return (
    <svg aria-hidden viewBox="0 0 370 300" fill="none" className={className}>
      {/* Faint full-height guide lines under each marker — grounds the path without competing with it. */}
      {MARKERS.map((m, i) => (
        <line
          key={`guide-${i}`}
          x1={m.x}
          y1={m.y}
          x2={m.x}
          y2="280"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeOpacity="0.35"
          strokeDasharray="2 4"
        />
      ))}
      <path
        d={pathD}
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="draw-line"
      />
      {MARKERS.map((m, i) => (
        <circle
          key={`marker-${i}`}
          cx={m.x}
          cy={m.y}
          r={i === MARKERS.length - 1 ? 6 : 4}
          fill="var(--color-bg)"
          stroke="currentColor"
          strokeWidth="1.5"
          className="draw-fade"
          style={{ animationDelay: `${300 + i * 140}ms` }}
        />
      ))}
    </svg>
  );
}
