export interface SingleElevationProps {
  className?: string;
}

const WINDOW_ROWS = 4;
const WINDOW_COLS = 3;

/**
 * One building facade, close-up — not <ArchitecturalMotif>'s full skyline
 * of several buildings. Used where the page is literally about a single
 * home considered on its own (Properties), so the visual should say "one
 * building," not "a city." Draws in via `.draw-line` (globals.css).
 */
export function SingleElevation({ className }: SingleElevationProps) {
  const windows = [];
  const gridX = 90;
  const gridY = 50;
  const gridWidth = 180;
  const gridHeight = 190;
  const cellW = gridWidth / WINDOW_COLS;
  const cellH = gridHeight / WINDOW_ROWS;
  const pad = 10;

  for (let r = 0; r < WINDOW_ROWS; r++) {
    for (let c = 0; c < WINDOW_COLS; c++) {
      windows.push({
        x: gridX + c * cellW + pad,
        y: gridY + r * cellH + pad,
        w: cellW - pad * 2,
        h: cellH - pad * 2,
        delay: 260 + (r * WINDOW_COLS + c) * 30,
      });
    }
  }

  return (
    <svg aria-hidden viewBox="0 0 360 300" fill="none" className={className}>
      {/* Building outline */}
      <rect
        x="90"
        y="50"
        width="180"
        height="220"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.5"
        className="draw-line"
      />
      {/* Roofline cap */}
      <path
        d="M80,50 L180,20 L280,50"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.25"
        className="draw-line"
        style={{ animationDelay: "150ms" }}
      />
      {/* Door */}
      <rect
        x="160"
        y="220"
        width="40"
        height="50"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.25"
        className="draw-line"
        style={{ animationDelay: "200ms" }}
      />
      {/* Window grid */}
      {windows.map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={w.y}
          width={w.w}
          height={w.h}
          stroke="currentColor"
          strokeWidth="0.75"
          className="draw-fade"
          style={{ animationDelay: `${w.delay}ms` }}
        />
      ))}
      {/* Ground line */}
      <line
        x1="40"
        y1="270"
        x2="320"
        y2="270"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1"
        className="draw-line"
        style={{ animationDelay: "80ms" }}
      />
    </svg>
  );
}
