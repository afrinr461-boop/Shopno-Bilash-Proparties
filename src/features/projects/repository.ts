import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Project } from "@/types/project";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for one
 * domain (Project — `src/types/project.ts`, the internal/admin shape, not
 * `content/projects.ts`'s public display shape). Backed by the real
 * database (`prisma/schema.prisma`'s `Project` model) — see
 * `src/lib/prismaRepository.ts`.
 */
export const projectRepository: Repository<Project> = createPrismaRepository<Project>("project");
