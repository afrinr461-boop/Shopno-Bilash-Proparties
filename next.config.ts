import type { NextConfig } from "next";

/**
 * Only the headers that are safe to apply site-wide without risking the
 * public site's own image/font loading (Admin Step 3 brief §24 explicitly
 * warns against this). A real Content-Security-Policy is deliberately
 * NOT included here — the public site loads Google Fonts and Next/Image
 * optimized images, and getting a CSP right for that without breaking
 * something needs careful, dedicated testing this step didn't have room
 * for. Documented as a remaining item in ARCHITECTURE.md.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  // Prisma's query engine ships a native binary — bundling it (the default
  // for anything imported into a Server Component) breaks under Turbopack.
  // Keeping it external makes Next.js `require()` it at runtime instead.
  serverExternalPackages: ["@prisma/client"],
  // Every real upload goes through `next/image` via `<Media>`, which
  // refuses any external host by default — this one exception is for
  // hotlinked Unsplash demo photography (free, real-estate stock images
  // used to populate a sample project), not a general external-image
  // allowlist.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Default Server Action body limit is 1MB — too small for a scanned
  // deed or agreement PDF (see src/lib/fileStorage.ts's own 15MB cap).
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
