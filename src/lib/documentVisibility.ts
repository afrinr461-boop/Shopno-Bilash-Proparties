import type { Document } from "@/types/document";

/**
 * Prompt 10 — Chapter 3 (the future Owner Portal) needs a firm rule for
 * which documents an authenticated owner may ever see, reusing the
 * existing `Document.visibility` (`DataVisibility`) field rather than
 * adding a parallel "ownerVisible" column. Explicit mapping, since the
 * field's four values had no documented per-value meaning before this:
 * - "restricted" / "internal" → admin/staff only, never the owner it's about.
 * - "private" → visible to the specific owner this document belongs to
 *   (and admin) — the actual "owner-visible" state.
 * - "public" → visible on the public website, a superset of "private".
 * A document with no `visibility` set at all (rows created before this
 * field existed) defaults to NOT owner-visible — the safe default matches
 * the brief's explicit "never expose unless explicitly marked" rule.
 */
export function isOwnerVisible(document: Document): boolean {
  return document.visibility === "private" || document.visibility === "public";
}
