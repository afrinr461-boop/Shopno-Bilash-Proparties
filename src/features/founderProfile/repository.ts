import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { FounderProfile } from "@/types/founderProfile";

export const FOUNDER_PROFILE_ID = "founder";

/**
 * `FounderProfile` is a singleton (one record, fixed id) — the one row is
 * seeded once by `prisma/seed.ts`, not created through the admin UI, same
 * pattern as `companySettingsRepository`.
 */
export const founderProfileRepository: Repository<FounderProfile> =
  createPrismaRepository<FounderProfile>("founderProfile");
