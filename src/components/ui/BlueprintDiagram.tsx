export interface BlueprintDiagramProps {
  className?: string;
}

/**
 * A different architectural drawing from <ArchitecturalMotif>'s skyline —
 * a floor-plan sketch (unit boundary, partitions, a door swing, dimension
 * ticks, a compass mark) instead of another set of buildings, so pages
 * that sit next to a Projects/Services hero don't all show the same
 * silhouette. Each shape carries `pathLength={100}` so the `.draw-line`
 * reveal animation (globals.css) is exact regardless of real geometry —
 * it only plays once wrapped in a visible `<Reveal>`.
 */
export function BlueprintDiagram({ className }: BlueprintDiagramProps) {
  return (
    <svg aria-hidden viewBox="0 0 400 300" fill="none" className={className}>
      {/* Unit boundary */}
      <rect
        x="40"
        y="30"
        width="320"
        height="200"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.5"
        className="draw-line"
      />

      {/* Partition walls */}
      <line
        x1="180"
        y1="30"
        x2="180"
        y2="118"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.25"
        className="draw-line"
        style={{ animationDelay: "200ms" }}
      />
      <line
        x1="180"
        y1="230"
        x2="180"
        y2="150"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.25"
        className="draw-line"
        style={{ animationDelay: "200ms" }}
      />
      <line
        x1="180"
        y1="150"
        x2="360"
        y2="150"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.25"
        className="draw-line"
        style={{ animationDelay: "320ms" }}
      />

      {/* Door leaf + swing arc, in the partition gap */}
      <line
        x1="180"
        y1="118"
        x2="180"
        y2="150"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.25"
        className="draw-line"
        style={{ animationDelay: "440ms" }}
      />
      <path
        d="M180,118 A32,32 0 0,1 212,150"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
        className="draw-line"
        style={{ animationDelay: "520ms" }}
      />

      {/* Dimension line + ticks along the bottom edge */}
      <line
        x1="40"
        y1="256"
        x2="360"
        y2="256"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1"
        className="draw-line"
        style={{ animationDelay: "600ms" }}
      />
      <line x1="40" y1="250" x2="40" y2="262" stroke="currentColor" strokeWidth="1" className="draw-fade" style={{ animationDelay: "900ms" }} />
      <line x1="200" y1="250" x2="200" y2="262" stroke="currentColor" strokeWidth="1" className="draw-fade" style={{ animationDelay: "950ms" }} />
      <line x1="360" y1="250" x2="360" y2="262" stroke="currentColor" strokeWidth="1" className="draw-fade" style={{ animationDelay: "1000ms" }} />

      {/* Compass mark */}
      <circle
        cx="336"
        cy="60"
        r="20"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1"
        className="draw-line"
        style={{ animationDelay: "700ms" }}
      />
      <path d="M336,46 L336,74 M330,53 L336,44 L342,53" stroke="currentColor" strokeWidth="1.25" className="draw-fade" style={{ animationDelay: "1050ms" }} />
    </svg>
  );
}
