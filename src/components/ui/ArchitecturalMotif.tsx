export interface ArchitecturalMotifProps {
  className?: string;
  /**
   * "contain" (default) — the whole skyline fits inside its box, letterboxed.
   * "cover" — fills the box edge-to-edge, grounded at the bottom, cropping
   * the sides/top as needed. Use "cover" for a full-bleed breakout panel.
   */
  fit?: "contain" | "cover";
}

interface Building {
  x: number;
  width: number;
  height: number;
  cols: number;
  rows: number;
}

const GROUND_Y = 240;
const PAD = 6;
const GAP = 4;

const BUILDINGS: Building[] = [
  { x: 4, width: 52, height: 120, cols: 2, rows: 5 },
  { x: 66, width: 38, height: 185, cols: 2, rows: 7 },
  { x: 114, width: 70, height: 90, cols: 3, rows: 3 },
  { x: 194, width: 44, height: 165, cols: 2, rows: 6 },
  { x: 248, width: 66, height: 140, cols: 3, rows: 5 },
  { x: 324, width: 42, height: 210, cols: 2, rows: 8 },
  { x: 376, width: 20, height: 70, cols: 1, rows: 2 },
];

function windowsFor(building: Building) {
  const cellW = (building.width - PAD * 2 - GAP * (building.cols - 1)) / building.cols;
  const cellH = (building.height - PAD * 2 - GAP * (building.rows - 1)) / building.rows;
  const rects: { x: number; y: number }[] = [];
  for (let r = 0; r < building.rows; r++) {
    for (let c = 0; c < building.cols; c++) {
      rects.push({
        x: building.x + PAD + c * (cellW + GAP),
        y: GROUND_Y - building.height + PAD + r * (cellH + GAP),
      });
    }
  }
  return { rects, cellW, cellH };
}

/**
 * A schematic city skyline — several building elevations of varying
 * height side by side, outline + window grid, stroke only, no fill. Fills
 * the empty side of a text-only editorial section with an architectural
 * presence (a "city", not a single block) without needing real
 * photography. Color comes from `currentColor`, so pass a text-* utility
 * (e.g. `text-border-strong`) via `className` to theme it.
 */
export function ArchitecturalMotif({ className, fit = "contain" }: ArchitecturalMotifProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 260"
      fill="none"
      className={className}
      preserveAspectRatio={fit === "cover" ? "xMidYMax slice" : "xMidYMid meet"}
    >
      {BUILDINGS.map((building) => {
        const { rects, cellW, cellH } = windowsFor(building);
        return (
          <g key={building.x}>
            <rect
              x={building.x}
              y={GROUND_Y - building.height}
              width={building.width}
              height={building.height}
              stroke="currentColor"
              strokeWidth="1.25"
            />
            {rects.map((w) => (
              <rect
                key={`${w.x}-${w.y}`}
                x={w.x}
                y={w.y}
                width={cellW}
                height={cellH}
                stroke="currentColor"
                strokeWidth="0.75"
              />
            ))}
          </g>
        );
      })}
      <line x1="0" y1={GROUND_Y} x2="400" y2={GROUND_Y} stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
