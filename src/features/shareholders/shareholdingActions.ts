"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { shareholdingRepository } from "@/features/shareholders/repository";
import { projectRepository } from "@/features/projects/repository";
import { unitRepository } from "@/features/units/repository";
import { openOwnershipRecord, closeOwnershipRecord } from "@/features/ownership/writeThrough";

export interface ShareholdingFormState {
  error?: string;
}

async function requireShareholderPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "shareholder.manage")) throw new Error("Forbidden");
  return user;
}

async function parseShareholdingFields(formData: FormData) {
  const shareholderId = String(formData.get("shareholderId") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const sharePercentageRaw = String(formData.get("sharePercentage") ?? "");
  const totalContributionRaw = String(formData.get("totalContribution") ?? "");

  if (!shareholderId) return { error: "Missing shareholder." } as const;
  if (!projectId) return { error: "Choose a project." } as const;
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." } as const;

  const sharePercentage = Number(sharePercentageRaw);
  if (!Number.isFinite(sharePercentage) || sharePercentage <= 0 || sharePercentage > 100) {
    return { error: "Enter a share percentage between 0 and 100." } as const;
  }
  const totalContribution = Number(totalContributionRaw);
  if (!Number.isFinite(totalContribution) || totalContribution < 0) return { error: "Enter a valid contribution amount." } as const;

  return { fields: { shareholderId, projectId, sharePercentage, totalContribution } } as const;
}

export async function createShareholding(
  _prevState: ShareholdingFormState,
  formData: FormData,
): Promise<ShareholdingFormState> {
  const user = await requireShareholderPermission();

  const parsed = await parseShareholdingFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await shareholdingRepository.create({
    id,
    shareholderId: fields.shareholderId,
    projectId: fields.projectId,
    sharePercentage: fields.sharePercentage,
    totalContribution: { amount: fields.totalContribution, currency: "BDT" },
    allocatedUnitIds: [],
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "shareholding.create", entityType: "Shareholding", entityId: id });

  revalidatePath(`/admin/shareholders/${fields.shareholderId}`);
  redirect(`/admin/shareholders/${fields.shareholderId}`);
}

export async function updateShareholding(
  id: string,
  _prevState: ShareholdingFormState,
  formData: FormData,
): Promise<ShareholdingFormState> {
  const user = await requireShareholderPermission();

  const parsed = await parseShareholdingFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await shareholdingRepository.findById(id);
  if (!existing) return { error: "This shareholding no longer exists." };

  const updated = await shareholdingRepository.update(id, {
    projectId: fields.projectId,
    sharePercentage: fields.sharePercentage,
    totalContribution: { amount: fields.totalContribution, currency: "BDT" },
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This shareholding no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "shareholding.update", entityType: "Shareholding", entityId: id });

  revalidatePath(`/admin/shareholders/${fields.shareholderId}`);
  redirect(`/admin/shareholders/${fields.shareholderId}`);
}

export async function deleteShareholding(shareholderId: string, id: string): Promise<void> {
  const user = await requireShareholderPermission();

  const existing = await shareholdingRepository.findById(id);
  if (!existing) return;

  await shareholdingRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "shareholding.delete", entityType: "Shareholding", entityId: id });

  revalidatePath(`/admin/shareholders/${shareholderId}`);
}

/**
 * Gives this shareholding a real unit — the fix for the unit-based-
 * ownership gap: `Shareholding.allocatedUnitIds` existed as a field before
 * this, but nothing ever populated it or synced `Unit.shareholderId`. A
 * unit must be currently unowned (no customer/shareholder/landowner
 * pointer set) — one unit belongs to exactly one owner.
 */
export async function assignUnitToShareholding(shareholderId: string, shareholdingId: string, unitId: string): Promise<{ error?: string }> {
  const user = await requireShareholderPermission();

  const holding = await shareholdingRepository.findById(shareholdingId);
  if (!holding) return { error: "This shareholding no longer exists." };

  const unit = await unitRepository.findById(unitId);
  if (!unit) return { error: "That unit no longer exists." };
  if (unit.customerId || unit.shareholderId || unit.landownerAllocationId) {
    return { error: "That unit already has an owner." };
  }

  await unitRepository.update(unitId, { shareholderId: holding.shareholderId, status: "allocated" });
  await shareholdingRepository.update(shareholdingId, { allocatedUnitIds: [...holding.allocatedUnitIds, unitId] });

  await openOwnershipRecord({
    targetType: "unit",
    targetId: unitId,
    projectId: unit.projectId,
    ownerType: "shareholder",
    ownerId: holding.shareholderId,
    source: "shareholding",
    sourceRecordId: shareholdingId,
    startDate: new Date().toISOString(),
    actorUserId: user.id,
  });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "shareholding.assignUnit",
    entityType: "Shareholding",
    entityId: shareholdingId,
  });

  revalidatePath(`/admin/shareholders/${shareholderId}`);
  return {};
}

/** Reverses `assignUnitToShareholding` — frees the unit back to "available". */
export async function unassignUnitFromShareholding(shareholderId: string, shareholdingId: string, unitId: string): Promise<void> {
  const user = await requireShareholderPermission();

  const holding = await shareholdingRepository.findById(shareholdingId);
  if (!holding) return;

  await unitRepository.update(unitId, { shareholderId: undefined, status: "available" });
  await shareholdingRepository.update(shareholdingId, {
    allocatedUnitIds: holding.allocatedUnitIds.filter((id) => id !== unitId),
  });
  await closeOwnershipRecord("unit", unitId);

  await recordAuditEvent({
    actorUserId: user.id,
    action: "shareholding.unassignUnit",
    entityType: "Shareholding",
    entityId: shareholdingId,
  });

  revalidatePath(`/admin/shareholders/${shareholderId}`);
}
