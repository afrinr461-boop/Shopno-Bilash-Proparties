"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { parkingRepository } from "@/features/parking/repository";
import { projectRepository } from "@/features/projects/repository";
import { openOwnershipRecord, closeOwnershipRecord } from "@/features/ownership/writeThrough";
import type { ParkingStatus, ParkingType } from "@/types/parking";
import type { OwnerType } from "@/types/finance/costAllocation";

export interface ParkingFormState {
  error?: string;
}

const PARKING_STATUSES: ParkingStatus[] = ["available", "assigned", "reserved", "unavailable"];
const PARKING_TYPES: ParkingType[] = ["car", "bike", "reserved-visitor"];
const OWNER_TYPES: OwnerType[] = ["customer", "shareholder", "landowner"];

function isParkingStatus(value: string): value is ParkingStatus {
  return (PARKING_STATUSES as string[]).includes(value);
}
function isParkingType(value: string): value is ParkingType {
  return (PARKING_TYPES as string[]).includes(value);
}
function isOwnerType(value: string): value is OwnerType {
  return (OWNER_TYPES as string[]).includes(value);
}

function toOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

async function requireParkingPermission(permission: "parking.view" | "parking.manage" = "parking.manage") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

async function parseParkingFields(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "").trim();
  const parkingNumber = String(formData.get("parkingNumber") ?? "").trim();
  const zone = String(formData.get("zone") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const status = String(formData.get("status") ?? "");
  const valueRaw = String(formData.get("value") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!projectId) return { error: "Choose a project." } as const;
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." } as const;
  if (!parkingNumber) return { error: "Enter a parking number, e.g. \"P-01\"." } as const;
  if (!isParkingStatus(status)) return { error: "Choose a valid status." } as const;
  if (type && !isParkingType(type)) return { error: "Choose a valid type." } as const;

  return {
    fields: {
      projectId,
      buildingId: buildingId || undefined,
      parkingNumber,
      zone: zone || undefined,
      type: type ? (type as ParkingType) : undefined,
      status,
      value: toOptionalNumber(valueRaw),
      notes: notes || undefined,
    },
  } as const;
}

export async function createParking(_prevState: ParkingFormState, formData: FormData): Promise<ParkingFormState> {
  const user = await requireParkingPermission();

  const parsed = await parseParkingFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await parkingRepository.create({
    id,
    projectId: fields.projectId,
    buildingId: fields.buildingId,
    parkingNumber: fields.parkingNumber,
    zone: fields.zone,
    type: fields.type,
    status: fields.status,
    value: fields.value !== undefined ? { amount: fields.value, currency: "BDT" } : undefined,
    notes: fields.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "parking.create", entityType: "Parking", entityId: id });

  revalidatePath("/admin/parking");
  revalidatePath(`/admin/projects/${fields.projectId}/parking`);
  redirect(`/admin/parking/${id}`);
}

export async function updateParking(id: string, _prevState: ParkingFormState, formData: FormData): Promise<ParkingFormState> {
  const user = await requireParkingPermission();

  const parsed = await parseParkingFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await parkingRepository.findById(id);
  if (!existing) return { error: "This parking space no longer exists." };

  await parkingRepository.update(id, {
    buildingId: fields.buildingId,
    parkingNumber: fields.parkingNumber,
    zone: fields.zone,
    type: fields.type,
    status: fields.status,
    value: fields.value !== undefined ? { amount: fields.value, currency: "BDT" } : undefined,
    notes: fields.notes,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });

  await recordAuditEvent({ actorUserId: user.id, action: "parking.update", entityType: "Parking", entityId: id });

  revalidatePath("/admin/parking");
  revalidatePath(`/admin/projects/${existing.projectId}/parking`);
  revalidatePath(`/admin/parking/${id}`);
  redirect(`/admin/parking/${id}`);
}

export async function deleteParking(id: string): Promise<void> {
  const user = await requireParkingPermission();

  const existing = await parkingRepository.findById(id);
  if (!existing) return;

  await parkingRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "parking.delete", entityType: "Parking", entityId: id });

  revalidatePath("/admin/parking");
  revalidatePath(`/admin/projects/${existing.projectId}/parking`);
}

/** Assigns a parking space to an owner, independent of any unit that owner may or may not hold. Opens the audit-trail span. */
export async function assignParkingToOwner(
  parkingId: string,
  ownerTypeRaw: string,
  ownerId: string,
): Promise<{ error?: string }> {
  const user = await requireParkingPermission();

  if (!isOwnerType(ownerTypeRaw)) return { error: "Choose a valid owner type." };
  const parking = await parkingRepository.findById(parkingId);
  if (!parking) return { error: "This parking space no longer exists." };
  if (parking.ownerType && parking.ownerId) return { error: "This parking space already has an owner." };

  const now = new Date().toISOString();
  await parkingRepository.update(parkingId, { ownerType: ownerTypeRaw, ownerId, status: "assigned" });
  await openOwnershipRecord({
    targetType: "parking",
    targetId: parkingId,
    projectId: parking.projectId,
    ownerType: ownerTypeRaw,
    ownerId,
    source: "manual",
    startDate: now,
    actorUserId: user.id,
  });

  revalidatePath("/admin/parking");
  revalidatePath(`/admin/projects/${parking.projectId}/parking`);
  return {};
}

export async function releaseParkingFromOwner(parkingId: string): Promise<void> {
  const user = await requireParkingPermission();

  const parking = await parkingRepository.findById(parkingId);
  if (!parking) return;

  await parkingRepository.update(parkingId, { ownerType: undefined, ownerId: undefined, status: "available" });
  await closeOwnershipRecord("parking", parkingId);

  await recordAuditEvent({ actorUserId: user.id, action: "parking.release", entityType: "Parking", entityId: parkingId });

  revalidatePath("/admin/parking");
  revalidatePath(`/admin/projects/${parking.projectId}/parking`);
}
