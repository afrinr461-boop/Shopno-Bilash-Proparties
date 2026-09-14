export interface GrowthPathMotifProps {
  className?: string;
}

interface Building {
  x: number;
  width: number;
  height: number;
}

const GROUND_Y = 300;
const PAD = 5;
const GAP = 5;
// One shared window module every building's grid is fit to, rather than a
// hand-picked cols/rows per building — that let each building's "bricks"
// come out a visibly different size from its neighbors, which is what read
// as unpolished. Rounding to the nearest whole column/row per building
// still leaves a touch of give, but never enough to look mismatched.
const TARGET_CELL_W = 13;
const TARGET_CELL_H = 17;

// Progressively taller, left to right — the skyline itself tells the
// growth story, not just an abstract line laid over it.
const BUILDINGS: Building[] = [
  { x: 20, width: 46, height: 70 },
  { x: 84, width: 40, height: 110 },
  { x: 142, width: 58, height: 150 },
  { x: 224, width: 44, height: 200 },
  { x: 292, width: 62, height: 250 },
];

function moduleCount(span: number, target: number) {
  return Math.max(1, Math.round((span - 2 * PAD + GAP) / (target + GAP)));
}

function windowsFor(building: Building) {
  const cols = moduleCount(building.width, TARGET_CELL_W);
  const rows = moduleCount(building.height, TARGET_CELL_H);
  const cellW = (building.width - PAD * 2 - GAP * (cols - 1)) / cols;
  const cellH = (building.height - PAD * 2 - GAP * (rows - 1)) / rows;
  const rects: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rects.push({
        x: building.x + PAD + c * (cellW + GAP),
        y: GROUND_Y - building.height + PAD + r * (cellH + GAP),
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
// rigid diagonal ruler line, not a "growth path". A fixed alternating bulge
// per segment fixed that but overcorrected into an obviously artificial
// zig-zag, especially across uneven segment lengths. A Catmull-Rom spline
// (converted to cubic Beziers) instead threads the same points with
// continuous, natural tangents — every stop still sits exactly on a
// rooftop, but the line between them curves the way a hand-drawn trend
// line would, not a mechanical wave.
function smoothPathThrough(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  const d = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

export function GrowthPathMotif({ className }: GrowthPathMotifProps) {
  const roofPoints = BUILDINGS.map((b) => ({ x: b.x + b.width / 2, y: GROUND_Y - b.height - 14 }));
  const pathD = smoothPathThrough(roofPoints);

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
