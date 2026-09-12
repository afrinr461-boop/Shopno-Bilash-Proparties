import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shopno Bilash Properties",
    short_name: "Shopno Bilash",
    description:
      "Premium real estate development, property sales, and landowner joint-venture management.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#1f3d33",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
