"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import {
  costAllocationRepository,
  ownerContributionRepository,
  contributionPaymentRepository,
  unitAllocationRepository,
  unitTierRepository,
} from "@/features/costAllocations/repository";
import { projectRepository } from "@/features/projects/repository";
import { unitRepository } from "@/features/units/repository";
import { landownerAllocationRepository } from "@/features/landowners/repository";
import { parkingRepository } from "@/features/parking/repository";
import { resolveDocumentOwner } from "@/features/documents/resolveOwner";
import { reconcileRounding } from "@/features/costAllocations/rounding";
import {
  resolveAllocationMethod,
  computeSqftShares,
  computeUnitRatioShares,
  computeCustomShares,
  computeTierShares,
  foldInParkingContributions,
  ownerKeyString,
  type OwnerKey,
  type OwnerUnitsEntry,
  type RawOwnerShare,
} from "@/features/costAllocations/allocationMethods";
import type { AllocationMethod, ContributionPaymentMethod, FineType } from "@/types/finance/costAllocation";
import type { Unit } from "@/types/unit";

export interface CostAllocationFormState {
  error?: string;
}

const FINE_TYPES: FineType[] = ["flat", "percentage"];
function isFineType(value: string): value is FineType {
  return (FINE_TYPES as string[]).includes(value);
}

const ALLOCATION_METHODS: AllocationMethod[] = ["sqft", "unit-ratio", "fixed-unit", "custom", "tier"];
function isAllocationMethod(value: string): value is AllocationMethod {
  return (ALLOCATION_METHODS as string[]).includes(value);
}

async function requireFinancePermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "finance.manage")) throw new Error("Forbidden");
  return user;
}

async function parseCostAllocationFields(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const totalAmountRaw = String(formData.get("totalAmount") ?? "");
  const allocationDate = String(formData.get("allocationDate") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const fineType = String(formData.get("fineType") ?? "");
  const fineValueRaw = String(formData.get("fineValue") ?? "");
  const allocationMethodRaw = String(formData.get("allocationMethod") ?? "sqft");
  const includeParkingInAllocation = formData.get("includeParkingInAllocation") === "on";

  if (!projectId) return { error: "Choose a project." } as const;
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." } as const;
  if (!title || title.length < 3) return { error: "Title must be at least 3 characters." } as const;
  if (!category) return { error: "Enter a category, e.g. \"Piling\" or \"Foundation\"." } as const;

  const totalAmount = Number(totalAmountRaw);
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) return { error: "Enter a valid total amount." } as const;
  if (!allocationDate) return { error: "Enter an allocation date." } as const;
  if (!dueDate) return { error: "Enter a due date." } as const;
  if (!isFineType(fineType)) return { error: "Choose a fine type." } as const;
  if (!isAllocationMethod(allocationMethodRaw)) return { error: "Choose a valid allocation method." } as const;

  const fineValue = Number(fineValueRaw);
  if (!Number.isFinite(fineValue) || fineValue < 0) return { error: "Enter a valid fine value." } as const;
  if (fineType === "percentage" && fineValue > 100) return { error: "Fine percentage can't exceed 100." } as const;

  return {
    fields: {
      projectId,
      title,
      category,
      totalAmount,
      allocationDate,
      dueDate,
      fineType,
      fineValue,
      allocationMethod: allocationMethodRaw,
      includeParkingInAllocation,
    },
  } as const;
}

export async function createCostAllocation(
  _prevState: CostAllocationFormState,
  formData: FormData,
): Promise<CostAllocationFormState> {
  const user = await requireFinancePermission();

  const parsed = await parseCostAllocationFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await costAllocationRepository.create({
    id,
    projectId: fields.projectId,
    title: fields.title,
    category: fields.category,
    totalAmount: { amount: fields.totalAmount, currency: "BDT" },
    allocationDate: fields.allocationDate,
    dueDate: fields.dueDate,
    fineType: fields.fineType,
    fineValue: fields.fineValue,
    allocationMethod: fields.allocationMethod,
    includeParkingInAllocation: fields.includeParkingInAllocation,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "costAllocation.create", entityType: "CostAllocation", entityId: id });

  revalidatePath("/admin/finance/cost-allocations");
  redirect(`/admin/finance/cost-allocations/${id}`);
}

export async function deleteCostAllocation(id: string): Promise<{ error?: string }> {
  const user = await requireFinancePermission();

  const existing = await costAllocationRepository.findById(id);
  if (!existing) return {};
  if (existing.status === "generated") {
    return { error: "Can't delete an allocation that already has contributions generated." };
  }

  await costAllocationRepository.remove(id);
  await recordAuditEvent({ actorUserId: user.id, action: "costAllocation.delete", entityType: "CostAllocation", entityId: id });

  revalidatePath("/admin/finance/cost-allocations");
  return {};
}

/**
 * Resolves each owned unit's `{ownerType, ownerId}` — the one place that
 * translates `Unit`'s three mutually-exclusive pointers
 * (`customerId`/`shareholderId`/`landownerAllocationId`) into the
 * `OwnerContribution` domain's `ownerType`/`ownerId` pair. Units with none
 * of the three set (still unsold/unallocated) resolve to `null` and are
 * excluded from cost splitting — the company absorbs its own unsold
 * inventory's share, standard practice (confirmed with the user; open to
 * revisiting later).
 */
async function resolveUnitOwner(unit: Unit): Promise<OwnerKey | null> {
  if (unit.customerId) return { ownerType: "customer", ownerId: unit.customerId };
  if (unit.shareholderId) return { ownerType: "shareholder", ownerId: unit.shareholderId };
  if (unit.landownerAllocationId) {
    const allocation = await landownerAllocationRepository.findById(unit.landownerAllocationId);
    if (!allocation) return null;
    return { ownerType: "landowner", ownerId: allocation.landownerId };
  }
  return null;
}

async function buildUnitsByOwner(units: Unit[]): Promise<Map<string, OwnerUnitsEntry>> {
  const unitsByOwner = new Map<string, OwnerUnitsEntry>();
  for (const unit of units) {
    const owner = await resolveUnitOwner(unit);
    if (!owner) continue;
    const k = ownerKeyString(owner);
    const entry = unitsByOwner.get(k) ?? { key: owner, units: [] };
    entry.units.push(unit);
    unitsByOwner.set(k, entry);
  }
  return unitsByOwner;
}

/** Dispatches to the allocation method's pure compute function — the one place `generateContributions` and `previewContributions` both call, so they can never drift apart. */
async function computeRawShares(
  allocation: { id: string; projectId: string; totalAmount: { amount: number }; allocationMethod?: AllocationMethod; includeParkingInAllocation?: boolean },
  unitsByOwner: Map<string, OwnerUnitsEntry>,
  allProjectUnits: Unit[],
  customUnitAmounts: Record<string, number>,
  customParkingAmounts: Record<string, number>,
): Promise<RawOwnerShare[] | { error: string }> {
  const method = resolveAllocationMethod(allocation.allocationMethod);
  let shares: RawOwnerShare[] | { error: string };

  switch (method) {
    case "unit-ratio":
      shares = computeUnitRatioShares(unitsByOwner, allocation.totalAmount.amount, allProjectUnits);
      break;
    case "fixed-unit":
    case "custom":
      shares = computeCustomShares(unitsByOwner, customUnitAmounts);
      break;
    case "tier": {
      const tiers = (await unitTierRepository.list()).filter((t) => t.costAllocationId === allocation.id);
      shares = computeTierShares(unitsByOwner, tiers, allocation.totalAmount.amount);
      break;
    }
    case "sqft":
    default:
      shares = computeSqftShares(unitsByOwner, allocation.totalAmount.amount);
      break;
  }

  if ("error" in shares) return shares;

  if (allocation.includeParkingInAllocation && (method === "fixed-unit" || method === "custom" || method === "tier")) {
    const parkingSpaces = (await parkingRepository.list()).filter((p) => p.projectId === allocation.projectId);
    shares = foldInParkingContributions(shares, parkingSpaces, customParkingAmounts);
  }

  return shares;
}

export interface AllocationPreviewRow {
  ownerType: string;
  ownerId: string;
  ownerName: string;
  ownerHref?: string;
  units: { id: string; unitNumber: string; sizeSqft: number }[];
  parkingNumbers: string[];
  basisLabel: string;
  payableAmount: number;
}

export interface AllocationPreview {
  method: AllocationMethod;
  rows: AllocationPreviewRow[];
  totalAllocated: number;
  roundingAdjustment: number;
}

/**
 * Read-only dry run — runs the exact same compute-then-reconcile pipeline
 * `generateContributions` uses, so the preview shown to the Admin can never
 * drift from what actually gets written on confirm. For "fixed-unit"/
 * "custom" methods, pass the same `customUnitAmounts`/`customParkingAmounts`
 * the Admin has typed so far — the preview reflects their in-progress entry.
 */
export async function previewContributions(
  costAllocationId: string,
  customUnitAmounts: Record<string, number> = {},
  customParkingAmounts: Record<string, number> = {},
): Promise<AllocationPreview | { error: string }> {
  await requireFinancePermission();

  const allocation = await costAllocationRepository.findById(costAllocationId);
  if (!allocation) return { error: "This allocation no longer exists." };

  const allProjectUnits = (await unitRepository.list()).filter((u) => u.projectId === allocation.projectId);
  const unitsByOwner = await buildUnitsByOwner(allProjectUnits);

  const rawShares = await computeRawShares(allocation, unitsByOwner, allProjectUnits, customUnitAmounts, customParkingAmounts);
  if ("error" in rawShares) return { error: rawShares.error };

  const reconciled = reconcileRounding(
    rawShares.map((s) => ({ key: s.key, amount: s.rawAmount })),
    allocation.totalAmount.amount,
  );

  const rows: AllocationPreviewRow[] = await Promise.all(
    rawShares.map(async (share) => {
      const resolved = await resolveDocumentOwner(share.ownerKey.ownerType, share.ownerKey.ownerId);
      return {
        ownerType: share.ownerKey.ownerType,
        ownerId: share.ownerKey.ownerId,
        ownerName: resolved.label,
        ownerHref: resolved.href,
        units: share.units.map((u) => ({ id: u.id, unitNumber: u.unitNumber, sizeSqft: u.sizeSqft })),
        parkingNumbers: (share.parkingAmounts ?? []).map((p) => p.parking.parkingNumber),
        basisLabel: share.basisLabel,
        payableAmount: reconciled.get(share.key) ?? 0,
      };
    }),
  );

  const totalAllocated = rows.reduce((s, r) => s + r.payableAmount, 0);
  const roundingAdjustment = allocation.totalAmount.amount - Math.round(rawShares.reduce((s, r) => s + r.rawAmount, 0));

  return { method: resolveAllocationMethod(allocation.allocationMethod), rows, totalAllocated, roundingAdjustment };
}

/**
 * The core engine — splits `CostAllocation.totalAmount` across every owned
 * unit's owner in the project via the allocation's chosen method. Generates
 * once; an allocation that's already `"generated"` refuses to run again, so
 * a cost is never accidentally billed twice. Uses the exact same
 * compute-then-reconcile pipeline as `previewContributions`.
 */
export async function generateContributions(
  costAllocationId: string,
  customUnitAmounts: Record<string, number> = {},
  customParkingAmounts: Record<string, number> = {},
): Promise<{ error?: string }> {
  const user = await requireFinancePermission();

  const allocation = await costAllocationRepository.findById(costAllocationId);
  if (!allocation) return { error: "This allocation no longer exists." };
  if (allocation.status === "generated") return { error: "Contributions have already been generated for this allocation." };

  const allProjectUnits = (await unitRepository.list()).filter((u) => u.projectId === allocation.projectId);
  const unitsByOwner = await buildUnitsByOwner(allProjectUnits);

  const rawShares = await computeRawShares(allocation, unitsByOwner, allProjectUnits, customUnitAmounts, customParkingAmounts);
  if ("error" in rawShares) return { error: rawShares.error };
  if (rawShares.length === 0) {
    return { error: "No owned units found in this project — nothing to allocate." };
  }

  const reconciled = reconcileRounding(
    rawShares.map((s) => ({ key: s.key, amount: s.rawAmount })),
    allocation.totalAmount.amount,
  );

  const method = resolveAllocationMethod(allocation.allocationMethod);
  const totalAllocatedSqft =
    method === "sqft" ? [...unitsByOwner.values()].reduce((sum, entry) => sum + entry.units.reduce((s, u) => s + u.sizeSqft, 0), 0) : undefined;

  const now = new Date().toISOString();

  for (const share of rawShares) {
    const payableAmount = reconciled.get(share.key) ?? 0;
    const unitSizeSqft = share.units.reduce((s, u) => s + u.sizeSqft, 0);
    const shareRatio = allocation.totalAmount.amount > 0 ? payableAmount / allocation.totalAmount.amount : 0;
    const contributionId = randomUUID();

    await ownerContributionRepository.create({
      id: contributionId,
      costAllocationId: allocation.id,
      projectId: allocation.projectId,
      ownerType: share.ownerKey.ownerType,
      ownerId: share.ownerKey.ownerId,
      unitIds: share.units.map((u) => u.id),
      unitSizeSqft,
      shareRatio,
      payableAmount: { amount: payableAmount, currency: "BDT" },
      paidAmount: { amount: 0, currency: "BDT" },
      dueDate: allocation.dueDate,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
    });

    // Unit-level breakdown — an immutable read-model row per unit, reconciled within the owner's own total so the per-unit amounts sum exactly to `payableAmount`.
    if (share.unitAmounts.length > 0) {
      const unitReconciled = reconcileRounding(
        share.unitAmounts.map((ua) => ({ key: ua.unit.id, amount: ua.rawAmount })),
        payableAmount,
      );
      for (const ua of share.unitAmounts) {
        const unitPayable = unitReconciled.get(ua.unit.id) ?? 0;
        await unitAllocationRepository.create({
          id: randomUUID(),
          costAllocationId: allocation.id,
          contributionId,
          projectId: allocation.projectId,
          unitId: ua.unit.id,
          ownerType: share.ownerKey.ownerType,
          ownerId: share.ownerKey.ownerId,
          sizeSqft: ua.unit.sizeSqft,
          ratio: payableAmount > 0 ? unitPayable / payableAmount : 0,
          payableAmount: { amount: unitPayable, currency: "BDT" },
          createdAt: now,
          updatedAt: now,
          createdBy: user.id,
        });
      }
    }
  }

  await costAllocationRepository.update(allocation.id, { status: "generated", totalAllocatedSqft });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "costAllocation.generate",
    entityType: "CostAllocation",
    entityId: allocation.id,
  });

  revalidatePath(`/admin/finance/cost-allocations/${allocation.id}`);
  return {};
}

/** Marks a fully-collected goal as explicitly closed out — a deliberate Admin action, never implied just by reaching 100% collection. */
export async function markCostAllocationCompleted(id: string): Promise<{ error?: string }> {
  const user = await requireFinancePermission();

  const allocation = await costAllocationRepository.findById(id);
  if (!allocation) return { error: "This allocation no longer exists." };
  if (allocation.status !== "generated") return { error: "Only a generated allocation can be marked completed." };

  await costAllocationRepository.update(id, { completedAt: new Date().toISOString() });
  await recordAuditEvent({ actorUserId: user.id, action: "costAllocation.complete", entityType: "CostAllocation", entityId: id });

  revalidatePath(`/admin/finance/cost-allocations/${id}`);
  return {};
}

/** Archives a goal regardless of its funding state — for old/irrelevant allocations an Admin wants out of the active list. */
export async function archiveCostAllocation(id: string): Promise<{ error?: string }> {
  const user = await requireFinancePermission();

  const allocation = await costAllocationRepository.findById(id);
  if (!allocation) return { error: "This allocation no longer exists." };

  await costAllocationRepository.update(id, { archivedAt: new Date().toISOString() });
  await recordAuditEvent({ actorUserId: user.id, action: "costAllocation.archive", entityType: "CostAllocation", entityId: id });

  revalidatePath(`/admin/finance/cost-allocations/${id}`);
  return {};
}

export interface ContributionPaymentFormState {
  error?: string;
}

const CONTRIBUTION_PAYMENT_METHODS: ContributionPaymentMethod[] = ["cash", "bank-transfer", "cheque", "mobile-banking", "card"];
function isContributionPaymentMethod(value: string): value is ContributionPaymentMethod {
  return (CONTRIBUTION_PAYMENT_METHODS as string[]).includes(value);
}

export async function recordContributionPayment(
  costAllocationId: string,
  _prevState: ContributionPaymentFormState,
  formData: FormData,
): Promise<ContributionPaymentFormState> {
  const user = await requireFinancePermission();

  const contributionId = String(formData.get("contributionId") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const date = String(formData.get("date") ?? "").trim();
  const method = String(formData.get("method") ?? "");
  const reference = String(formData.get("reference") ?? "").trim();
  const receiptNumber = String(formData.get("receiptNumber") ?? "").trim();
  const installmentObligationId = String(formData.get("installmentObligationId") ?? "").trim();

  if (!contributionId) return { error: "Missing contribution." };
  const contribution = await ownerContributionRepository.findById(contributionId);
  if (!contribution) return { error: "This contribution no longer exists." };

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter a valid payment amount." };
  if (!date) return { error: "Enter a payment date." };
  if (!isContributionPaymentMethod(method)) return { error: "Choose a valid payment method." };

  const id = randomUUID();
  const now = new Date().toISOString();

  await contributionPaymentRepository.create({
    id,
    contributionId,
    amount: { amount, currency: "BDT" },
    date,
    method,
    reference: reference || undefined,
    receiptNumber: receiptNumber || undefined,
    installmentObligationId: installmentObligationId || undefined,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  const allPayments = await contributionPaymentRepository.list();
  const paidAmount = allPayments.filter((p) => p.contributionId === contributionId).reduce((sum, p) => sum + p.amount.amount, 0);

  await ownerContributionRepository.update(contributionId, { paidAmount: { amount: paidAmount, currency: "BDT" } });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "contributionPayment.create",
    entityType: "ContributionPayment",
    entityId: id,
  });

  revalidatePath(`/admin/finance/cost-allocations/${costAllocationId}`);
  redirect(`/admin/finance/cost-allocations/${costAllocationId}`);
}
