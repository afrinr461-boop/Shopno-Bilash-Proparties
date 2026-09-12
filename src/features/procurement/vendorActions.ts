"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { vendorRepository, purchaseRepository } from "@/features/procurement/repository";
import type { LifecycleStatus } from "@/types/procurement";

export interface VendorFormState {
  error?: string;
}

function toList(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

async function requireProcurementPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "procurement.manage")) throw new Error("Forbidden");
  return user;
}

function parseVendorFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactPerson = String(formData.get("contactPerson") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const businessInfo = String(formData.get("businessInfo") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const categoriesRaw = String(formData.get("categories") ?? "");

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." } as const;
  if (!phone) return { error: "Enter a phone number." } as const;

  return {
    fields: {
      name,
      companyName: companyName || undefined,
      contactPerson: contactPerson || undefined,
      phone,
      email: email || undefined,
      address: address || undefined,
      businessInfo: businessInfo || undefined,
      notes: notes || undefined,
      categories: toList(categoriesRaw),
    },
  } as const;
}

export async function createVendor(_prevState: VendorFormState, formData: FormData): Promise<VendorFormState> {
  const user = await requireProcurementPermission();

  const parsed = parseVendorFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await vendorRepository.create({
    id,
    name: fields.name,
    companyName: fields.companyName,
    contactPerson: fields.contactPerson,
    phone: fields.phone,
    email: fields.email,
    address: fields.address,
    businessInfo: fields.businessInfo,
    notes: fields.notes,
    categories: fields.categories,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "vendor.create", entityType: "Vendor", entityId: id });

  revalidatePath("/admin/procurement");
  redirect("/admin/procurement");
}

export async function updateVendor(id: string, _prevState: VendorFormState, formData: FormData): Promise<VendorFormState> {
  const user = await requireProcurementPermission();

  const parsed = parseVendorFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await vendorRepository.findById(id);
  if (!existing) return { error: "This vendor no longer exists." };

  const updated = await vendorRepository.update(id, {
    name: fields.name,
    companyName: fields.companyName,
    contactPerson: fields.contactPerson,
    phone: fields.phone,
    email: fields.email,
    address: fields.address,
    businessInfo: fields.businessInfo,
    notes: fields.notes,
    categories: fields.categories,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This vendor no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "vendor.update", entityType: "Vendor", entityId: id });

  revalidatePath("/admin/procurement");
  revalidatePath(`/admin/procurement/${id}`);
  redirect(`/admin/procurement/${id}`);
}

/** Hard delete only when this supplier has no purchase history — otherwise use `setVendorStatus` to retire it. */
export async function deleteVendor(id: string): Promise<{ error?: string }> {
  const user = await requireProcurementPermission();

  const existing = await vendorRepository.findById(id);
  if (!existing) return {};

  const purchases = await purchaseRepository.list();
  if (purchases.some((p) => p.vendorId === id)) {
    return { error: "This supplier has purchase history — set it to Inactive instead of deleting." };
  }

  await vendorRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "vendor.delete", entityType: "Vendor", entityId: id });

  revalidatePath("/admin/procurement");
  return {};
}

export async function setVendorStatus(id: string, status: LifecycleStatus): Promise<{ error?: string }> {
  const user = await requireProcurementPermission();

  const existing = await vendorRepository.findById(id);
  if (!existing) return { error: "This supplier no longer exists." };

  await vendorRepository.update(id, { status, updatedBy: user.id, updatedAt: new Date().toISOString() });
  await recordAuditEvent({ actorUserId: user.id, action: "vendor.setStatus", entityType: "Vendor", entityId: id });

  revalidatePath("/admin/procurement");
  revalidatePath(`/admin/procurement/${id}`);
  return {};
}
