export interface LostPathProps {
  className?: string;
}

const TICKS = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * A compass with no destination marked — a wandering dashed path that
 * trails off into dots rather than arriving anywhere. The 404 page's own
 * visual identity, distinct from every other motif on the site (skyline,
 * floor plan, node network, photo frames, single elevation, land plot).
 * Draws in via `.draw-line` (globals.css).
 */
export function LostPath({ className }: LostPathProps) {
  return (
    <svg aria-hidden viewBox="0 0 360 300" fill="none" className={className}>
      <circle
        cx="180"
        cy="150"
        r="110"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1"
        className="draw-line"
      />
      {TICKS.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 180 + Math.sin(rad) * 100;
        const y1 = 150 - Math.cos(rad) * 100;
        const x2 = 180 + Math.sin(rad) * 110;
        const y2 = 150 - Math.cos(rad) * 110;
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1"
            className="draw-fade"
            style={{ animationDelay: `${500 + i * 40}ms` }}
          />
        );
      })}
      {/* A path that starts solid and trails off into dots, going nowhere */}
      <path
        d="M180,150 C210,120 230,140 250,110"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.25"
        className="draw-line"
        style={{ animationDelay: "250ms" }}
      />
      <path
        d="M250,110 C265,90 275,95 288,78"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="1 6"
        strokeLinecap="round"
        className="draw-line"
        style={{ animationDelay: "550ms" }}
      />
      <circle cx="180" cy="150" r="4" fill="currentColor" className="draw-fade" style={{ animationDelay: "150ms" }} />
    </svg>
  );
}
