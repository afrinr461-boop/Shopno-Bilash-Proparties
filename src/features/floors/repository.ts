import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Floor } from "@/types/project";

export const floorRepository: Repository<Floor> = createPrismaRepository<Floor>("floor");
