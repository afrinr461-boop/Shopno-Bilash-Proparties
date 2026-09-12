import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Parking } from "@/types/parking";

export const parkingRepository: Repository<Parking> = createPrismaRepository<Parking>("parking");
