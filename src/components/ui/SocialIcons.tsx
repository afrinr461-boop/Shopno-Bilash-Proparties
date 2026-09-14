import type { SVGProps } from "react";

/**
 * lucide-react dropped brand/social icons a while back (trademark
 * concerns), so the handful this footer actually needs are hand-drawn
 * here instead — same stroke-based, `currentColor` convention as every
 * lucide icon elsewhere in the app, sized the same way (`className`
 * controls size/color, no separate `size` prop needed).
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <path d="M15 3h-2a5 5 0 0 0-5 5v3H6v4h2v6h4v-6h3l1-4h-4V8a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="7.5" y1="10" x2="7.5" y2="16.5" />
      <circle cx="7.5" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
      <path d="M11.5 16.5V10" />
      <path d="M11.5 12.8a2.3 2.3 0 0 1 4.6 0v3.7" />
    </svg>
  );
}

export function TiktokIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 4c.3 2 1.8 3.5 4 3.7" />
    </svg>
  );
}

export function PinterestIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 18c.6-2 1.6-6 1.6-6" />
      <path d="M9.7 12.3a2.6 2.6 0 0 1 2.5-3.3c1.5 0 2.6 1 2.6 2.8 0 2-1 3.7-2.6 3.7-.8 0-1.4-.5-1.6-1" />
    </svg>
  );
}
