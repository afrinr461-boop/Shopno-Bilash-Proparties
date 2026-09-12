import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Reminder } from "@/types/reminder";

export const reminderRepository: Repository<Reminder> = createPrismaRepository<Reminder>("reminder");
