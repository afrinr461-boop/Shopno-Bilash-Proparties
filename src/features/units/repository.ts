import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Unit } from "@/types/unit";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for the
 * Unit domain (`types/unit.ts` — the internal/admin shape: a sellable unit
 * that MUST belong to a Project via `projectId`, plus `buildingId`/
 * `floorId`). This is deliberately not `types/property.ts`'s `Property` —
 * that's a separate, optional-project-link "standalone listing" concept
 * (resale/marketplace) that Admin Step 6 does not touch. It's also
 * separate from `content/units.ts`'s public display shape, same
 * internal/public split already established for Project (Admin Step 1).
 *
 * No public route or API should ever serve records from this repository
 * directly — the public site keeps reading `content/units.ts` (now backed
 * by `unitContentRepository`) until a later CMS step wires the two
 * together (see the note in `src/lib/properties.ts`).
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const unitRepository: Repository<Unit> = createPrismaRepository<Unit>("unit");
