/**
 * "Properties" is not a separate data model — it's a public-facing view over
 * the existing `units` (content/units.ts) joined to their parent `projects`
 * (content/projects.ts). This file only joins and derives; it introduces no
 * new content source, so a future Admin Panel keeps one place (Unit) to
 * manage a listing that both /properties and /projects/[slug]/units/[slug]
 * read from.
 */
import { projects, type Project } from "@/content/projects";
import { units, type Unit } from "@/content/units";

export interface PropertyListing extends Unit {
  project: Project;
}

/**
 * Every unit paired with its parent project — silently drops a unit whose
 * project no longer exists rather than crash. Reads the *static* files —
 * kept this way deliberately because this function is also called from a
 * client component (`components/saved/SavedPageContent.tsx`) and from
 * `lib/searchIndex.ts`, neither of which can `await` a repository call
 * without a larger restructure. Use `getPropertyListingsAsync` in
 * `lib/propertiesAsync.ts` for any new server-side caller — that one reads
 * the real, admin-editable CMS data.
 *
 * `getPropertyListingsAsync` used to live in this same file, but it (and
 * the repositories it calls) is now backed by Prisma, which is marked
 * `import "server-only"` (`src/lib/db.ts`) — keeping it here would make
 * *this whole file* unsafe to import from `SavedPageContent.tsx` (a client
 * component), since a `server-only` dependency anywhere in a file poisons
 * every export from it, not just the one function that uses it. Splitting
 * it into its own file is what actually fixes that, not a workaround.
 */
export function getPropertyListings(): PropertyListing[] {
  return units.reduce<PropertyListing[]>((acc, unit) => {
    const project = projects.find((p) => p.slug === unit.projectSlug);
    if (project) acc.push({ ...unit, project });
    return acc;
  }, []);
}

function uniqueSorted(values: (string | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort();
}

export function getPropertyTypes(listings: PropertyListing[]): string[] {
  return uniqueSorted(listings.map((l) => l.unitType));
}

export function getPropertyLocations(listings: PropertyListing[]): string[] {
  return uniqueSorted(listings.map((l) => l.project.city));
}

export function getPropertyBedroomCounts(listings: PropertyListing[]): number[] {
  return Array.from(new Set(listings.map((l) => l.bedrooms).filter((b): b is number => b !== undefined))).sort(
    (a, b) => a - b,
  );
}

/** Projects that currently have at least one published unit — the set the "Explore by Development" section and the Project filter draw from. */
export function getProjectsWithListings(listings: PropertyListing[]): Project[] {
  const bySlug = new Map<string, Project>();
  for (const listing of listings) bySlug.set(listing.project.slug, listing.project);
  return Array.from(bySlug.values());
}

/**
 * Parses a formatted price string (e.g. "৳1.2 Crore", "৳45 Lakh") into a
 * comparable number, for sorting only — the display string is always what's
 * actually shown. Returns null for anything unparseable rather than guessing.
 */
export function parsePriceToNumber(price?: string): number | null {
  if (!price) return null;
  const match = price.match(/([\d,.]+)\s*(crore|lakh)?/i);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ""));
  if (Number.isNaN(num)) return null;
  const unit = match[2]?.toLowerCase();
  if (unit === "crore") return num * 1e7;
  if (unit === "lakh") return num * 1e5;
  return num;
}

export const STATUS_PRIORITY: Record<Unit["status"], number> = {
  available: 0,
  reserved: 1,
  "on-hold": 2,
  sold: 3,
};
