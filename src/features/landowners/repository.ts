import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Landowner, Agreement, LandownerAllocation } from "@/types/landowner";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for the
 * Landowner domain (`types/landowner.ts`) — people who bring land into a
 * joint-venture development instead of buying a unit. A `Landowner` is the
 * person, an `Agreement` is the signed JV terms with the company for one
 * project, and a `LandownerAllocation` is a unit handed back to them under
 * that agreement (e.g. "35% of built units").
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const landownerRepository: Repository<Landowner> = createPrismaRepository<Landowner>("landowner");
export const agreementRepository: Repository<Agreement> = createPrismaRepository<Agreement>("agreement");
export const landownerAllocationRepository: Repository<LandownerAllocation> =
  createPrismaRepository<LandownerAllocation>("landownerAllocation");
