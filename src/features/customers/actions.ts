"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { customerRepository } from "@/features/customers/repository";
import type { CustomerStatus } from "@/types/customer";

export interface CustomerFormState {
  error?: string;
}

const CUSTOMER_STATUSES: CustomerStatus[] = ["active", "inactive", "archived"];

function isCustomerStatus(value: string): value is CustomerStatus {
  return (CUSTOMER_STATUSES as string[]).includes(value);
}

async function requireCustomerPermission(permission: "customer.create" | "customer.update" | "customer.delete") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

function parseCustomerFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const alternatePhone = String(formData.get("alternatePhone") ?? "").trim();
  const presentAddress = String(formData.get("presentAddress") ?? "").trim();
  const permanentAddress = String(formData.get("permanentAddress") ?? "").trim();
  const nidOrPassportNumber = String(formData.get("nidOrPassportNumber") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." } as const;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." } as const;
  if (!phone) return { error: "Enter a phone number." } as const;
  if (!isCustomerStatus(status)) return { error: "Choose a valid status." } as const;

  return {
    fields: {
      name,
      email,
      phone,
      alternatePhone: alternatePhone || undefined,
      presentAddress: presentAddress || undefined,
      permanentAddress: permanentAddress || undefined,
      nidOrPassportNumber: nidOrPassportNumber || undefined,
      status,
      notes: notes || undefined,
    },
  } as const;
}

export async function createCustomer(_prevState: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  const user = await requireCustomerPermission("customer.create");

  const parsed = parseCustomerFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await customerRepository.create({
    id,
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    alternatePhone: fields.alternatePhone,
    presentAddress: fields.presentAddress,
    permanentAddress: fields.permanentAddress,
    nidOrPassportNumber: fields.nidOrPassportNumber,
    status: fields.status,
    notes: fields.notes,
    unitIds: [],
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "customer.create", entityType: "Customer", entityId: id });

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomer(
  id: string,
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const user = await requireCustomerPermission("customer.update");

  const parsed = parseCustomerFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await customerRepository.findById(id);
  if (!existing) return { error: "This customer no longer exists." };

  const updated = await customerRepository.update(id, {
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    alternatePhone: fields.alternatePhone,
    presentAddress: fields.presentAddress,
    permanentAddress: fields.permanentAddress,
    nidOrPassportNumber: fields.nidOrPassportNumber,
    status: fields.status,
    notes: fields.notes,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This customer no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "customer.update", entityType: "Customer", entityId: id });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  redirect(`/admin/customers/${id}`);
}

export async function deleteCustomer(id: string): Promise<void> {
  const user = await requireCustomerPermission("customer.delete");

  const existing = await customerRepository.findById(id);
  if (!existing) return;

  await customerRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "customer.delete", entityType: "Customer", entityId: id });

  revalidatePath("/admin/customers");
}
