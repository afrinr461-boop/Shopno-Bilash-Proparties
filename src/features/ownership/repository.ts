import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { OwnershipRecord, OwnershipTransfer } from "@/types/ownership";

export const ownershipRecordRepository: Repository<OwnershipRecord> = createPrismaRepository<OwnershipRecord>("ownershipRecord");

/** Prompt 8 §7 — see `types/ownership.ts`'s `OwnershipTransfer` doc comment. */
export const ownershipTransferRepository: Repository<OwnershipTransfer> = createPrismaRepository<OwnershipTransfer>("ownershipTransfer");
