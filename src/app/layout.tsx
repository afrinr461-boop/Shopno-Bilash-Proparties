import type { Metadata } from "next";
import { Inter, Manrope, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali"],
  display: "swap",
});

// No production domain has been assigned yet — set NEXT_PUBLIC_SITE_URL
// when this site is deployed for real so absolute URLs (Open Graph images,
// canonical links, the sitemap) resolve correctly. Falls back to localhost
// for development rather than inventing a placeholder domain.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shopno Bilash Properties",
    template: "%s | Shopno Bilash Properties",
  },
  description:
    "Shopno Bilash Properties — premium real estate development, property sales, and landowner joint-venture management, built on trust and designed for the future.",
  openGraph: {
    siteName: "Shopno Bilash Properties",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} ${manrope.variable} ${notoSansBengali.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-bg text-fg">
        {children}
      </body>
    </html>
  );
}
