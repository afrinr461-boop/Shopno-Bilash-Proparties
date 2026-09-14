export interface GrowthPathMotifProps {
  className?: string;
}

interface Building {
  x: number;
  width: number;
  height: number;
  cols: number;
  rows: number;
}

const GROUND_Y = 300;

// Progressively taller, left to right — the skyline itself tells the
// growth story, not just an abstract line laid over it.
const BUILDINGS: Building[] = [
  { x: 20, width: 46, height: 70, cols: 2, rows: 3 },
  { x: 84, width: 40, height: 110, cols: 2, rows: 5 },
  { x: 142, width: 58, height: 150, cols: 3, rows: 6 },
  { x: 224, width: 44, height: 200, cols: 2, rows: 8 },
  { x: 292, width: 62, height: 250, cols: 3, rows: 10 },
];

function windowsFor(building: Building) {
  const pad = 5;
  const gap = 5;
  const cellW = (building.width - pad * 2 - gap * (building.cols - 1)) / building.cols;
  const cellH = (building.height - pad * 2 - gap * (building.rows - 1)) / building.rows;
  const rects: { x: number; y: number }[] = [];
  for (let r = 0; r < building.rows; r++) {
    for (let c = 0; c < building.cols; c++) {
      rects.push({
        x: building.x + pad + c * (cellW + gap),
        y: GROUND_Y - building.height + pad + r * (cellH + gap),
      });
    }
  }
  return { rects, cellW, cellH };
}

/**
 * "Our Story"'s own motif — a skyline that grows taller left to right, roof
 * lines linked by an ascending path in the brand accent. Built (not
 * reused) for this section specifically: an ascending-line chart alone read
 * as too bare, and a plain skyline (`<ArchitecturalMotif>`) doesn't carry
 * the "growth over time" idea the timeline beside it is actually telling —
 * this fuses both languages instead of picking one. Draws in via
 * `.draw-line`/`.draw-fade` (globals.css) — no animation library, fires
 * once via the existing `<Reveal>`/IntersectionObserver wrapper.
 */
// A straight-segment polyline through steadily-taller roofs reads as one
// rigid diagonal ruler line, not a "growth path" — this bows each segment
// into a gentle S-curve instead (control points nudged off-axis, alternating
// which side they bulge to), so the line still touches every rooftop but
// gets there on a soft wave rather than a straight run.
function wavyPathThrough(points: { x: number; y: number }[]) {
  const [first, ...rest] = points;
  let d = `M ${first.x} ${first.y}`;
  let prev = first;
  rest.forEach((point, i) => {
    const dx = point.x - prev.x;
    const dy = point.y - prev.y;
    const bulge = i % 2 === 0 ? -16 : 16;
    const c1x = prev.x + dx * 0.33;
    const c1y = prev.y + dy * 0.33 + bulge;
    const c2x = prev.x + dx * 0.66;
    const c2y = prev.y + dy * 0.66 - bulge;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${point.x} ${point.y}`;
    prev = point;
  });
  return d;
}

export function GrowthPathMotif({ className }: GrowthPathMotifProps) {
  const roofPoints = BUILDINGS.map((b) => ({ x: b.x + b.width / 2, y: GROUND_Y - b.height - 14 }));
  const pathD = wavyPathThrough(roofPoints);

  return (
    <svg aria-hidden viewBox="0 0 380 320" fill="none" className={className}>
      <defs>
        <radialGradient id="growth-path-glow" cx="85%" cy="15%" r="55%">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft glow behind the tallest (most recent) building — a quiet focal point, not a literal sun. */}
      <circle cx="323" cy="48" r="130" fill="url(#growth-path-glow)" className="draw-fade" style={{ animationDelay: "0ms" }} />

      {BUILDINGS.map((building, i) => {
        const { rects, cellW, cellH } = windowsFor(building);
        return (
          <g key={building.x}>
            <rect
              x={building.x}
              y={GROUND_Y - building.height}
              width={building.width}
              height={building.height}
              pathLength={100}
              stroke="currentColor"
              strokeWidth="1.25"
              className="draw-line"
              style={{ animationDelay: `${i * 90}ms` }}
            />
            {rects.map((w, wi) => (
              <rect
                key={`${w.x}-${w.y}`}
                x={w.x}
                y={w.y}
                width={cellW}
                height={cellH}
                fill="currentColor"
                fillOpacity="0.12"
                className="draw-fade"
                style={{ animationDelay: `${300 + i * 90 + wi * 8}ms` }}
              />
            ))}
          </g>
        );
      })}

      <line x1="0" y1={GROUND_Y} x2="380" y2={GROUND_Y} pathLength={100} stroke="currentColor" strokeWidth="1.25" className="draw-line" />

      {/* The ascending story, in brand accent — set apart from the neutral skyline underneath it. */}
      <path
        d={pathD}
        pathLength={100}
        stroke="var(--color-accent)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 7"
        className="draw-line"
        style={{ animationDelay: "500ms" }}
      />
      {roofPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === roofPoints.length - 1 ? 6 : 4}
          fill="var(--color-bg)"
          stroke="var(--color-accent)"
          strokeWidth="1.75"
          className="draw-fade"
          style={{ animationDelay: `${650 + i * 110}ms` }}
        />
      ))}
    </svg>
  );
}
