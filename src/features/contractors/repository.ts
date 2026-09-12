import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { Contractor, ContractorAssignment, ContractorPayment } from "@/types/contractor";

export const contractorRepository: Repository<Contractor> = createPrismaRepository<Contractor>("contractor");
export const contractorAssignmentRepository: Repository<ContractorAssignment> =
  createPrismaRepository<ContractorAssignment>("contractorAssignment");
export const contractorPaymentRepository: Repository<ContractorPayment> =
  createPrismaRepository<ContractorPayment>("contractorPayment");
