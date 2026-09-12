export interface SkylineBarsProps {
  className?: string;
}

const BARS = [8, 18, 28, 40, 52, 64, 76, 88];

/**
 * A simpler cousin of <ArchitecturalMotif> — plain vertical bars, no window
 * grid — used with `preserveAspectRatio="none"`, which stretches to exactly
 * fill its box on every axis. Unlike <ArchitecturalMotif>'s "cover" fit
 * (which crops a fixed-proportion skyline against the box, clipping
 * building tops on very wide/short panels), this never crops anything —
 * the right choice for panels whose aspect ratio varies a lot (the closing
 * CTA family), rather than fighting the crop with container tricks.
 */
export function SkylineBars({ className }: SkylineBarsProps) {
  return (
    <svg aria-hidden className={className} preserveAspectRatio="none" viewBox="0 0 100 100">
      {BARS.map((x, i) => (
        <rect key={x} x={x} y={100 - (20 + (i % 3) * 14)} width="2.2" height={20 + (i % 3) * 14} fill="currentColor" />
      ))}
    </svg>
  );
}
