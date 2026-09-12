"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { shareholderRepository } from "@/features/shareholders/repository";

export interface ShareholderFormState {
  error?: string;
}

async function requireShareholderPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "shareholder.manage")) throw new Error("Forbidden");
  return user;
}

function parseShareholderFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." } as const;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." } as const;
  if (!phone) return { error: "Enter a phone number." } as const;

  return { fields: { name, email, phone } } as const;
}

export async function createShareholder(
  _prevState: ShareholderFormState,
  formData: FormData,
): Promise<ShareholderFormState> {
  const user = await requireShareholderPermission();

  const parsed = parseShareholderFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await shareholderRepository.create({
    id,
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "shareholder.create", entityType: "Shareholder", entityId: id });

  revalidatePath("/admin/shareholders");
  redirect("/admin/shareholders");
}

export async function updateShareholder(
  id: string,
  _prevState: ShareholderFormState,
  formData: FormData,
): Promise<ShareholderFormState> {
  const user = await requireShareholderPermission();

  const parsed = parseShareholderFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await shareholderRepository.findById(id);
  if (!existing) return { error: "This shareholder no longer exists." };

  const updated = await shareholderRepository.update(id, {
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This shareholder no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "shareholder.update", entityType: "Shareholder", entityId: id });

  revalidatePath("/admin/shareholders");
  revalidatePath(`/admin/shareholders/${id}`);
  redirect(`/admin/shareholders/${id}`);
}

export async function deleteShareholder(id: string): Promise<void> {
  const user = await requireShareholderPermission();

  const existing = await shareholderRepository.findById(id);
  if (!existing) return;

  await shareholderRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "shareholder.delete", entityType: "Shareholder", entityId: id });

  revalidatePath("/admin/shareholders");
}
