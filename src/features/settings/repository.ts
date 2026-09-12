import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { CompanySettings } from "@/types/settings";

export const COMPANY_SETTINGS_ID = "company";

/**
 * Admin Step 20 — Settings Foundation. `CompanySettings` is a singleton
 * (one record, fixed id), so the one real row — seeded from the same real
 * values already public on the site (`content/legal.ts`'s `COMPANY`
 * constant and the root layout's page title) — is inserted once by
 * `prisma/seed.ts`, not by this module. `address`/`phone`/`email`/
 * `website` start unset, matching `content/contact.ts`'s `contactInfo` —
 * no real office contact details exist yet, so none are fabricated here
 * either.
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const companySettingsRepository: Repository<CompanySettings> =
  createPrismaRepository<CompanySettings>("companySettings");
