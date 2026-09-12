import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Shareholder, Shareholding } from "@/types/shareholder";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for the
 * Shareholder domain (`types/shareholder.ts`) — people who've put money
 * into a project in exchange for a stake (`Shareholding.sharePercentage`)
 * and, optionally, allocated units back. A `Shareholder` is the person; a
 * `Shareholding` is one project-scoped stake — one shareholder can hold
 * stakes in several projects, each tracked as its own record, which is
 * what lets a project's shareholder list stay genuinely separate from
 * another project's (ARCHITECTURE.md §13 Security).
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const shareholderRepository: Repository<Shareholder> = createPrismaRepository<Shareholder>("shareholder");
export const shareholdingRepository: Repository<Shareholding> = createPrismaRepository<Shareholding>("shareholding");
