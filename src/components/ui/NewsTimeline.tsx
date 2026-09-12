export interface NewsTimelineProps {
  className?: string;
}

const ENTRIES = [
  { x: 50, barLen: 90, up: true },
  { x: 110, barLen: 60, up: false },
  { x: 175, barLen: 110, up: true },
  { x: 245, barLen: 70, up: false },
  { x: 305, barLen: 95, up: true },
];

/**
 * A chronological feed — a baseline with dated entries branching off it,
 * rather than a static image. News is sequential by nature, so the visual
 * says that directly instead of reusing another page's motif. Draws in via
 * `.draw-line` (globals.css).
 */
export function NewsTimeline({ className }: NewsTimelineProps) {
  const baseY = 150;

  return (
    <svg aria-hidden viewBox="0 0 360 300" fill="none" className={className}>
      <line
        x1="30"
        y1={baseY}
        x2="330"
        y2={baseY}
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.25"
        className="draw-line"
      />
      {ENTRIES.map((entry, i) => {
        const tickEndY = entry.up ? baseY - 26 : baseY + 26;
        const barY = entry.up ? tickEndY - entry.barLen : tickEndY;
        return (
          <g key={i}>
            <line
              x1={entry.x}
              y1={baseY}
              x2={entry.x}
              y2={tickEndY}
              pathLength={100}
              stroke="currentColor"
              strokeWidth="1"
              className="draw-line"
              style={{ animationDelay: `${150 + i * 90}ms` }}
            />
            <rect
              x={entry.x - 9}
              y={barY}
              width="18"
              height={entry.barLen}
              stroke="currentColor"
              strokeWidth="0.75"
              className="draw-fade"
              style={{ animationDelay: `${450 + i * 90}ms` }}
            />
            <circle cx={entry.x} cy={baseY} r="3" fill="currentColor" className="draw-fade" style={{ animationDelay: `${150 + i * 90}ms` }} />
          </g>
        );
      })}
    </svg>
  );
}
