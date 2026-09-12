export interface NetworkMotifProps {
  className?: string;
}

const NODES = [
  { x: 60, y: 200 },
  { x: 140, y: 90 },
  { x: 210, y: 170 },
  { x: 270, y: 60 },
  { x: 320, y: 150 },
  { x: 200, y: 250 },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 4],
  [0, 2],
  [2, 5],
];

/**
 * A third distinct architectural-adjacent motif — a connected-node diagram
 * standing in for "many services, one company," rather than repeating
 * <ArchitecturalMotif>'s skyline or <BlueprintDiagram>'s floor plan on a
 * third page in a row. Lines draw in via `.draw-line` (globals.css); nodes
 * fade in after, once wrapped in a visible `<Reveal>`.
 */
export function NetworkMotif({ className }: NetworkMotifProps) {
  return (
    <svg aria-hidden viewBox="0 0 360 280" fill="none" className={className}>
      {EDGES.map(([a, b], i) => {
        const from = NODES[a];
        const to = NODES[b];
        return (
          <line
            key={`${a}-${b}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            pathLength={100}
            stroke="currentColor"
            strokeWidth="1"
            className="draw-line"
            style={{ animationDelay: `${i * 90}ms` }}
          />
        );
      })}
      {NODES.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={i === 2 ? 7 : 5}
          fill="currentColor"
          className="draw-fade"
          style={{ animationDelay: `${700 + i * 60}ms` }}
        />
      ))}
    </svg>
  );
}
