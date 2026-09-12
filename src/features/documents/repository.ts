import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Document } from "@/types/document";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for the
 * Document domain (`types/document.ts`) — one polymorphic record type
 * that can belong to a company/project/unit/customer/shareholder/
 * landowner/vendor/transaction via `ownerType`/`ownerId`, rather than a
 * separate documents table per owner kind.
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const documentRepository: Repository<Document> = createPrismaRepository<Document>("document");
