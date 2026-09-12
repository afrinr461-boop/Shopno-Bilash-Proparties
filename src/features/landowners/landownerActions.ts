"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { landownerRepository } from "@/features/landowners/repository";

export interface LandownerFormState {
  error?: string;
}

async function requireLandownerPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "landowner.manage")) throw new Error("Forbidden");
  return user;
}

function parseLandownerFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." } as const;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." } as const;
  if (!phone) return { error: "Enter a phone number." } as const;

  return { fields: { name, email, phone } } as const;
}

export async function createLandowner(_prevState: LandownerFormState, formData: FormData): Promise<LandownerFormState> {
  const user = await requireLandownerPermission();

  const parsed = parseLandownerFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await landownerRepository.create({
    id,
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    propertyIds: [],
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "landowner.create", entityType: "Landowner", entityId: id });

  revalidatePath("/admin/landowners");
  redirect("/admin/landowners");
}

export async function updateLandowner(
  id: string,
  _prevState: LandownerFormState,
  formData: FormData,
): Promise<LandownerFormState> {
  const user = await requireLandownerPermission();

  const parsed = parseLandownerFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await landownerRepository.findById(id);
  if (!existing) return { error: "This landowner no longer exists." };

  const updated = await landownerRepository.update(id, {
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This landowner no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "landowner.update", entityType: "Landowner", entityId: id });

  revalidatePath("/admin/landowners");
  revalidatePath(`/admin/landowners/${id}`);
  redirect(`/admin/landowners/${id}`);
}

export async function deleteLandowner(id: string): Promise<void> {
  const user = await requireLandownerPermission();

  const existing = await landownerRepository.findById(id);
  if (!existing) return;

  await landownerRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "landowner.delete", entityType: "Landowner", entityId: id });

  revalidatePath("/admin/landowners");
}
