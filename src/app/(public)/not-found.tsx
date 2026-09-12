import type { Metadata } from "next";
import { NotFoundContent } from "@/components/errors/NotFoundContent";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

/**
 * Catches every `notFound()` call inside the `(public)` route group (an
 * invalid project/unit/news slug) — renders inside this group's own
 * layout, so Header/Footer show exactly as on any other page.
 */
export default function PublicNotFound() {
  return <NotFoundContent />;
}
