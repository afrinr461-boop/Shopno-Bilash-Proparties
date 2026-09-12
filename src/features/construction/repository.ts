import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { ConstructionPhase, ConstructionTask, Milestone, ScheduleRevision, ConstructionActivityLog } from "@/types/construction";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for the
 * Construction domain (`types/construction.ts`). Phase belongs to Project,
 * Task belongs to Phase, Milestone belongs to Project (optionally linked to
 * a Phase), ScheduleRevision/ConstructionActivityLog are append-only logs.
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const constructionPhaseRepository: Repository<ConstructionPhase> =
  createPrismaRepository<ConstructionPhase>("constructionPhase");
export const constructionTaskRepository: Repository<ConstructionTask> =
  createPrismaRepository<ConstructionTask>("constructionTask");
export const milestoneRepository: Repository<Milestone> = createPrismaRepository<Milestone>("milestone");
export const scheduleRevisionRepository: Repository<ScheduleRevision> =
  createPrismaRepository<ScheduleRevision>("scheduleRevision");
export const constructionActivityLogRepository: Repository<ConstructionActivityLog> =
  createPrismaRepository<ConstructionActivityLog>("constructionActivityLog");
