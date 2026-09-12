"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, hasAnyPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { ownershipTransferRepository } from "@/features/ownership/repository";
import { openOwnershipRecord, closeOwnershipRecord } from "@/features/ownership/writeThrough";
import { resolveUnitOwner } from "@/features/ownership/resolveUnitOwner";
import { unitRepository } from "@/features/units/repository";
import { customerRepository } from "@/features/customers/repository";
import type { ObligationHandling, OwnershipTransferStatus } from "@/types/ownership";

export interface OwnershipTransferFormState {
  error?: string;
}

const OBLIGATION_HANDLINGS: ObligationHandling[] = ["previous-pays", "new-assumes", "split", "waived", "adjusted", "other"];
function isObligationHandling(value: string): value is ObligationHandling {
  return (OBLIGATION_HANDLINGS as string[]).includes(value);
}

async function requireUnitPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "unit.manage")) throw new Error("Forbidden");
  return user;
}

/** Approve/reject specifically — also reachable from the cross-domain Approval Queue (Prompt 9), gated on `approvals.manage` as an alternative to `unit.manage`. */
async function requireTransferReviewPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasAnyPermission(user.role, ["unit.manage", "approvals.manage"])) throw new Error("Forbidden");
  return user;
}

/** Actually moves ownership — closes the old `OwnershipRecord` span, opens a new one, and updates `Unit`'s fast-path owner field, same "close then open, never overwrite" pattern every other ownership change in this app uses. Only called once a transfer is in "completed" status. */
async function executeTransfer(transferId: string, unitId: string, projectId: string, newCustomerId: string, date: string, actorUserId: string) {
  await closeOwnershipRecord("unit", unitId, date);
  await openOwnershipRecord({
    targetType: "unit",
    targetId: unitId,
    projectId,
    ownerType: "customer",
    ownerId: newCustomerId,
    source: "transfer",
    sourceRecordId: transferId,
    startDate: date,
    actorUserId,
  });
  await unitRepository.update(unitId, {
    customerId: newCustomerId,
    shareholderId: undefined,
    landownerAllocationId: undefined,
    status: "transferred",
  });
}

/**
 * Prompt 8 §7 — reassigns a unit already owned by someone to a new
 * customer (the common resale case), as an explicit record rather than
 * silently overwriting `Unit.customerId`. Scoped to "new owner = customer"
 * only — transferring TO a shareholder/landowner instead still goes
 * through the existing "Assign Owner" flow (`AssignOwnerDrawer`), which
 * already handles the extra `Shareholding`/`LandownerAllocation` records
 * those owner types need. `obligationHandling` is recorded as a decision
 * for the team to act on manually in the Cost Allocation screens — this
 * does not itself reassign `OwnerContribution`/`Installment` rows (no
 * accounting logic beyond what's asked, matching every other adjustment
 * feature in this app).
 */
export async function createOwnershipTransfer(
  unitId: string,
  _prevState: OwnershipTransferFormState,
  formData: FormData,
): Promise<OwnershipTransferFormState> {
  const user = await requireUnitPermission();

  const newOwnerId = String(formData.get("newOwnerId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const transferValueRaw = String(formData.get("transferValue") ?? "").trim();
  const obligationHandling = String(formData.get("obligationHandling") ?? "");
  const statusRaw = String(formData.get("status") ?? "completed");

  const unit = await unitRepository.findById(unitId);
  if (!unit) return { error: "This unit no longer exists." };

  const currentOwner = await resolveUnitOwner(unit);
  if (!currentOwner) return { error: "This unit has no current owner to transfer from." };

  if (!newOwnerId) return { error: "Choose the new owner." };
  const newCustomer = await customerRepository.findById(newOwnerId);
  if (!newCustomer) return { error: "That customer no longer exists." };
  if (currentOwner.ownerType === "customer" && currentOwner.ownerId === newOwnerId) {
    return { error: "The new owner must be different from the current owner." };
  }
  if (!date) return { error: "Enter a transfer date." };
  if (!reason || reason.length < 3) return { error: "Enter a reason (at least 3 characters)." };
  if (!isObligationHandling(obligationHandling)) return { error: "Choose how outstanding obligations are handled." };

  const status: OwnershipTransferStatus = statusRaw === "pending" ? "pending" : "completed";
  const transferValue = transferValueRaw ? Number(transferValueRaw) : undefined;

  const id = randomUUID();
  const now = new Date().toISOString();

  await ownershipTransferRepository.create({
    id,
    unitId,
    projectId: unit.projectId,
    previousOwnerType: currentOwner.ownerType,
    previousOwnerId: currentOwner.ownerId,
    newOwnerType: "customer",
    newOwnerId,
    date,
    reason,
    transferValue: transferValue !== undefined && Number.isFinite(transferValue) ? { amount: transferValue, currency: "BDT" } : undefined,
    obligationHandling,
    status,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  if (status === "completed") {
    await executeTransfer(id, unitId, unit.projectId, newOwnerId, date, user.id);
  }

  await recordAuditEvent({ actorUserId: user.id, action: "ownershipTransfer.create", entityType: "OwnershipTransfer", entityId: id });

  revalidatePath(`/admin/properties/${unitId}`);
  return {};
}

/** Approves and executes a "pending" transfer — the ownership move only happens now, not at create time. */
export async function approveOwnershipTransfer(id: string): Promise<{ error?: string }> {
  const user = await requireTransferReviewPermission();

  const transfer = await ownershipTransferRepository.findById(id);
  if (!transfer) return { error: "This transfer no longer exists." };
  if (transfer.status !== "pending") return { error: "Only a pending transfer can be approved." };

  await ownershipTransferRepository.update(id, { status: "approved", updatedBy: user.id, updatedAt: new Date().toISOString() });
  await executeTransfer(id, transfer.unitId, transfer.projectId, transfer.newOwnerId, transfer.date, user.id);
  await ownershipTransferRepository.update(id, { status: "completed" });

  await recordAuditEvent({ actorUserId: user.id, action: "ownershipTransfer.approve", entityType: "OwnershipTransfer", entityId: id });

  revalidatePath(`/admin/properties/${transfer.unitId}`);
  return {};
}

export async function rejectOwnershipTransfer(id: string): Promise<{ error?: string }> {
  const user = await requireTransferReviewPermission();

  const transfer = await ownershipTransferRepository.findById(id);
  if (!transfer) return { error: "This transfer no longer exists." };
  if (transfer.status !== "pending") return { error: "Only a pending transfer can be rejected." };

  await ownershipTransferRepository.update(id, { status: "rejected", updatedBy: user.id, updatedAt: new Date().toISOString() });

  await recordAuditEvent({ actorUserId: user.id, action: "ownershipTransfer.reject", entityType: "OwnershipTransfer", entityId: id });

  revalidatePath(`/admin/properties/${transfer.unitId}`);
  return {};
}
