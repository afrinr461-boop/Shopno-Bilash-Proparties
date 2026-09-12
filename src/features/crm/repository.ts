import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Lead } from "@/types/crm";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for the
 * Lead domain (`types/crm.ts`). The public contact form's `submitEnquiry()`
 * (`components/contact/EnquiryForm.tsx`) is still an explicit placeholder
 * that never persists anything — wiring it to actually create a `Lead`
 * here is a separate, larger step (it touches the public Chapter 1 form),
 * not part of this admin-side foundation. `LeadActivity` (same file, a
 * call/message/note log per lead) is not given a repository here either —
 * deferred, same as `Booking`/`Contract` were from Admin Step 9.
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const leadRepository: Repository<Lead> = createPrismaRepository<Lead>("lead");
