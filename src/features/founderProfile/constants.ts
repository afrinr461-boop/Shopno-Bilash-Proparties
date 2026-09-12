/**
 * Shared by both the "use server" action and the "use client" form —
 * deliberately its own file with zero other imports, so it never drags the
 * `server-only` dependency chain (`repository.ts` → `prismaRepository.ts`
 * → `db.ts`) into the client bundle.
 */
export const FOUNDER_GALLERY_SLOTS = 3;
