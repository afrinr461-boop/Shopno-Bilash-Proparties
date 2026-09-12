export interface TrustEmblemProps {
  className?: string;
  /**
   * "contain" (default) — the whole emblem fits inside its box, letterboxed.
   * "cover" — fills the box edge-to-edge, centered, cropping as needed.
   */
  fit?: "contain" | "cover";
}

const CX = 300;
const CY = 130;

const RING_RADII = [36, 66, 100];

const ORBIT_NODES = [
  { radius: 66, angle: -35 },
  { radius: 66, angle: 145 },
  { radius: 100, angle: 20 },
  { radius: 100, angle: 100 },
  { radius: 100, angle: 200 },
  { radius: 100, angle: 300 },
];

/** Distant satellite nodes stretching the composition toward the panel's
 * edges — same visual language (a ring + a point) as the central emblem,
 * so the wide dark band either side of the emblem reads as part of one
 * connected constellation instead of empty space next to a small circle. */
const SATELLITES = [
  { x: 70, y: 70, r: 14 },
  { x: 40, y: 190, r: 9 },
  { x: 530, y: 60, r: 10 },
  { x: 560, y: 195, r: 15 },
];

function point(radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

const STAR_POINTS = Array.from({ length: 8 }, (_, i) => point(30, i * 45)).map((p) => `${p.x},${p.y}`).join(" ");

/**
 * A radiant compass/trust-network emblem — concentric rings, an eight-point
 * star core, and orbiting nodes joined by faint arcs. Built for the
 * "Built on trust" dark band (replaces `ArchitecturalMotif` there): a
 * deliberately non-architectural motif, never used elsewhere on the site.
 * Stroke only, `currentColor`-themed, same `fit` API as `ArchitecturalMotif`
 * for a drop-in swap.
 */
export function TrustEmblem({ className, fit = "contain" }: TrustEmblemProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 260"
      fill="none"
      className={className}
      preserveAspectRatio={fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
    >
      {RING_RADII.map((r) => (
        <circle key={r} cx={CX} cy={CY} r={r} stroke="currentColor" strokeWidth="0.75" opacity={r === 66 ? 0.6 : 0.35} />
      ))}

      {ORBIT_NODES.map((node) => {
        const p = point(node.radius, node.angle);
        return <line key={`${node.radius}-${node.angle}`} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="currentColor" strokeWidth="0.5" opacity="0.3" />;
      })}

      <polygon points={STAR_POINTS} stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <circle cx={CX} cy={CY} r="4" fill="currentColor" />

      {ORBIT_NODES.map((node) => {
        const p = point(node.radius, node.angle);
        return <circle key={`node-${node.radius}-${node.angle}`} cx={p.x} cy={p.y} r={node.radius === 66 ? 3.5 : 2.5} stroke="currentColor" strokeWidth="1" />;
      })}

      <line x1={CX - 130} y1={CY} x2={CX - 106} y2={CY} stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
      <line x1={CX + 106} y1={CY} x2={CX + 130} y2={CY} stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
      <line x1={CX} y1={CY - 130} x2={CX} y2={CY - 106} stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
      <line x1={CX} y1={CY + 106} x2={CX} y2={CY + 130} stroke="currentColor" strokeWidth="0.75" opacity="0.4" />

      {SATELLITES.map((s) => (
        <line key={`line-${s.x}-${s.y}`} x1={CX} y1={CY} x2={s.x} y2={s.y} stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
      ))}
      {SATELLITES.map((s) => (
        <g key={`sat-${s.x}-${s.y}`}>
          <circle cx={s.x} cy={s.y} r={s.r} stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <circle cx={s.x} cy={s.y} r="2" fill="currentColor" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}
