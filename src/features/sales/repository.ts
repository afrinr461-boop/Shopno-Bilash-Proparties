import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Sale, Installment, Booking } from "@/types/sales";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for the
 * Sale domain (`types/sales.ts`) — a unit actually sold to a customer.
 * `types/sales.ts` also defines `Booking` (a pre-sale reservation) and
 * `Contract` (the signed paperwork) — both share the same `unitId`/
 * `customerId` keys as `Sale` but are siblings, not children of it, so
 * they get no repository here. Admin Step 9 is scoped to Sale only;
 * Booking/Contract are left for a later step to decide their own admin
 * surface, per the roadmap.
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const saleRepository: Repository<Sale> = createPrismaRepository<Sale>("sale");

/**
 * Admin Step 21 — Installments Foundation. `Installment.contractId`
 * references `Contract`, which still has no repository (deliberately
 * deferred from Admin Step 9) — so `contractId` is shown as a raw id on
 * every list/detail page, not resolved to a customer or unit, same
 * honest "no repository, no resolved name" pattern as Unit's
 * `buildingId`/`floorId` (Admin Step 6).
 */
export const installmentRepository: Repository<Installment> = createPrismaRepository<Installment>("installment");

/** Prompt 8 §1/§4 — `Booking` finally gets its own repository, deferred from Admin Step 9 (see `saleRepository`'s doc comment above). */
export const bookingRepository: Repository<Booking> = createPrismaRepository<Booking>("booking");
