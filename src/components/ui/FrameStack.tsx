export interface FrameStackProps {
  className?: string;
}

const FRAMES = [
  { x: 40, y: 55, rotate: -7, originX: 110, originY: 145, delay: 0 },
  { x: 108, y: 65, rotate: 4, originX: 178, originY: 155, delay: 180 },
  { x: 176, y: 48, rotate: -2, originX: 246, originY: 138, delay: 360 },
];

/**
 * A fanned stack of photo frames — the Gallery page's own visual accent,
 * distinct from the skyline (<ArchitecturalMotif>), floor plan
 * (<BlueprintDiagram>) and node network (<NetworkMotif>) used elsewhere.
 * A gallery's subject is photographs, not buildings, so this draws that
 * instead. Frames draw in via `.draw-line` (globals.css), the small corner
 * marks fade in after.
 */
export function FrameStack({ className }: FrameStackProps) {
  return (
    <svg aria-hidden viewBox="0 0 360 280" fill="none" className={className}>
      {FRAMES.map((frame, i) => (
        <rect
          key={i}
          x={frame.x}
          y={frame.y}
          width="140"
          height="180"
          rx="2"
          pathLength={100}
          stroke="currentColor"
          strokeWidth="1.25"
          transform={`rotate(${frame.rotate} ${frame.originX} ${frame.originY})`}
          className="draw-line"
          style={{ animationDelay: `${frame.delay}ms` }}
        />
      ))}
      {/* Corner registration marks on the topmost frame, like a print crop mark */}
      <g
        transform={`rotate(${FRAMES[2].rotate} ${FRAMES[2].originX} ${FRAMES[2].originY})`}
        className="draw-fade"
        style={{ animationDelay: "650ms" }}
      >
        <path d="M176,68 L176,48 L196,48" stroke="currentColor" strokeWidth="1" />
        <path d="M296,208 L316,208 L316,228" stroke="currentColor" strokeWidth="1" />
      </g>
    </svg>
  );
}
