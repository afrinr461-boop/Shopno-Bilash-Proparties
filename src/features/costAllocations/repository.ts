import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type {
  CostAllocation,
  OwnerContribution,
  ContributionPayment,
  UnitAllocation,
  GoalInstallment,
  OwnerInstallmentObligation,
  ContributionAdjustment,
  UnitTier,
} from "@/types/finance/costAllocation";

/**
 * Unit-based cost-allocation engine — splits a shared construction cost
 * across every unit owner in a project by unit size (`sizeSqft`), instead
 * of the flat `Shareholding.sharePercentage` model. See
 * `src/types/finance/costAllocation.ts` for the full domain shape and
 * `src/lib/contributionStatus.ts` for how paid/overdue/fine are derived.
 */
export const costAllocationRepository: Repository<CostAllocation> =
  createPrismaRepository<CostAllocation>("costAllocation");

export const ownerContributionRepository: Repository<OwnerContribution> =
  createPrismaRepository<OwnerContribution>("ownerContribution");

export const contributionPaymentRepository: Repository<ContributionPayment> =
  createPrismaRepository<ContributionPayment>("contributionPayment");

export const unitAllocationRepository: Repository<UnitAllocation> =
  createPrismaRepository<UnitAllocation>("unitAllocation");

export const goalInstallmentRepository: Repository<GoalInstallment> =
  createPrismaRepository<GoalInstallment>("goalInstallment");

export const ownerInstallmentObligationRepository: Repository<OwnerInstallmentObligation> =
  createPrismaRepository<OwnerInstallmentObligation>("ownerInstallmentObligation");

export const contributionAdjustmentRepository: Repository<ContributionAdjustment> =
  createPrismaRepository<ContributionAdjustment>("contributionAdjustment");

export const unitTierRepository: Repository<UnitTier> = createPrismaRepository<UnitTier>("unitTier");
