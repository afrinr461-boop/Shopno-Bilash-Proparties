export interface PlotOutlineProps {
  className?: string;
}

const BOUNDARY = "M40,220 L70,60 L200,30 L300,80 L280,210 L150,250 Z";
const MARKERS = [
  { x: 40, y: 220 },
  { x: 70, y: 60 },
  { x: 200, y: 30 },
  { x: 300, y: 80 },
  { x: 280, y: 210 },
  { x: 150, y: 250 },
];

/**
 * A surveyed land parcel — an irregular boundary with corner markers and a
 * compass, not a building at all. Used where the page is about land itself
 * (Landowner/JV), distinct from the floor plan (<BlueprintDiagram>, a
 * building's interior) and the skyline (<ArchitecturalMotif>, many
 * buildings). Draws in via `.draw-line` (globals.css).
 */
export function PlotOutline({ className }: PlotOutlineProps) {
  return (
    <svg aria-hidden viewBox="0 0 360 300" fill="none" className={className}>
      <path
        d={BOUNDARY}
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        className="draw-line"
      />
      {MARKERS.map((m, i) => (
        <circle
          key={i}
          cx={m.x}
          cy={m.y}
          r="4"
          fill="currentColor"
          className="draw-fade"
          style={{ animationDelay: `${500 + i * 70}ms` }}
        />
      ))}
      {/* Compass */}
      <circle
        cx="320"
        cy="240"
        r="20"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1"
        className="draw-line"
        style={{ animationDelay: "700ms" }}
      />
      <path
        d="M320,226 L320,254 M313,233 L320,224 L327,233"
        stroke="currentColor"
        strokeWidth="1.25"
        className="draw-fade"
        style={{ animationDelay: "950ms" }}
      />
    </svg>
  );
}
