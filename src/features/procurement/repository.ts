import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type {
  Vendor,
  MaterialCategory,
  Material,
  PurchaseOrder,
  Purchase,
  PurchaseReceipt,
  StockMovement,
  MaterialThreshold,
} from "@/types/procurement";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for the
 * Procurement domain (`types/procurement.ts`) — the developer's materials
 * cost ledger: who materials are bought from (Vendor), what's bought
 * (Material/MaterialCategory), what was ordered (PurchaseOrder, with line
 * items), and what was actually invoiced/paid (Purchase, linked back to its
 * PurchaseOrder). Labor cost is deliberately not modeled here — it's already
 * covered by `ProjectExpense.category` (Admin Step 13's Expenses), which is
 * a free-text category on a project cost record, exactly what a labor fee
 * line is.
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const vendorRepository: Repository<Vendor> = createPrismaRepository<Vendor>("vendor");
export const materialCategoryRepository: Repository<MaterialCategory> =
  createPrismaRepository<MaterialCategory>("materialCategory");
export const materialRepository: Repository<Material> = createPrismaRepository<Material>("material");
export const purchaseOrderRepository: Repository<PurchaseOrder> =
  createPrismaRepository<PurchaseOrder>("purchaseOrder");
export const purchaseRepository: Repository<Purchase> = createPrismaRepository<Purchase>("purchase");
export const purchaseReceiptRepository: Repository<PurchaseReceipt> = createPrismaRepository<PurchaseReceipt>("purchaseReceipt");
export const stockMovementRepository: Repository<StockMovement> = createPrismaRepository<StockMovement>("stockMovement");
export const materialThresholdRepository: Repository<MaterialThreshold> =
  createPrismaRepository<MaterialThreshold>("materialThreshold");
