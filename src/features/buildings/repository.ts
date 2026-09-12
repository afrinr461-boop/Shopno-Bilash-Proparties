import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Building } from "@/types/project";

export const buildingRepository: Repository<Building> = createPrismaRepository<Building>("building");
