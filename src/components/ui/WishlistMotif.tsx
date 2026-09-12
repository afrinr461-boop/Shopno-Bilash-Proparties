export interface WishlistMotifProps {
  className?: string;
}

const DOTS = [
  { x: 40, y: 50 },
  { x: 320, y: 60 },
  { x: 360, y: 220 },
  { x: 30, y: 230 },
];

/**
 * An outlined heart with a few orbiting marks — the Saved/Wishlist page's
 * own visual accent (fills the header row's empty right side when nothing
 * is saved yet). Same stroke-only, `currentColor` convention as the rest
 * of the `components/ui` motif family.
 */
export function WishlistMotif({ className }: WishlistMotifProps) {
  return (
    <svg aria-hidden viewBox="0 0 400 280" fill="none" className={className}>
      <path
        d="M200 220 C120 160 60 120 60 70 C60 35 90 15 125 15 C155 15 180 35 200 65 C220 35 245 15 275 15 C310 15 340 35 340 70 C340 120 280 160 200 220 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {DOTS.map((d) => (
        <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r="3" fill="currentColor" opacity="0.6" />
      ))}
    </svg>
  );
}
