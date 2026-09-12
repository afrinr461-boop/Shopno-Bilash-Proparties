"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { installmentRepository } from "@/features/sales/repository";
import type { InstallmentStatus } from "@/types/sales";

export interface InstallmentFormState {
  error?: string;
}

const INSTALLMENT_STATUSES: InstallmentStatus[] = ["pending", "due-soon", "paid", "overdue"];

function isInstallmentStatus(value: string): value is InstallmentStatus {
  return (INSTALLMENT_STATUSES as string[]).includes(value);
}

async function requireSalesPermission(permission: "sales.create" | "sales.update" | "sales.delete") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

function parseInstallmentFields(formData: FormData) {
  const contractId = String(formData.get("contractId") ?? "").trim();
  const installmentNumberRaw = String(formData.get("installmentNumber") ?? "");
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const status = String(formData.get("status") ?? "");
  const paidDate = String(formData.get("paidDate") ?? "").trim();

  if (!contractId) return { error: "Enter a contract id — no Contract module exists yet, so this stays a free-text reference." } as const;
  const installmentNumber = Number(installmentNumberRaw);
  if (!Number.isInteger(installmentNumber) || installmentNumber < 1) return { error: "Enter a valid installment number." } as const;
  if (!dueDate) return { error: "Enter a due date." } as const;
  if (!isInstallmentStatus(status)) return { error: "Choose a valid status." } as const;

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter a valid amount." } as const;

  return {
    fields: { contractId, installmentNumber, dueDate, amount, status, paidDate: paidDate || undefined },
  } as const;
}

export async function createInstallment(
  _prevState: InstallmentFormState,
  formData: FormData,
): Promise<InstallmentFormState> {
  const user = await requireSalesPermission("sales.create");

  const parsed = parseInstallmentFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await installmentRepository.create({
    id,
    contractId: fields.contractId,
    installmentNumber: fields.installmentNumber,
    dueDate: fields.dueDate,
    amount: { amount: fields.amount, currency: "BDT" },
    status: fields.status,
    paidDate: fields.paidDate,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "installment.create", entityType: "Installment", entityId: id });

  revalidatePath("/admin/sales/installments");
  redirect("/admin/sales/installments");
}

export async function updateInstallment(
  id: string,
  _prevState: InstallmentFormState,
  formData: FormData,
): Promise<InstallmentFormState> {
  const user = await requireSalesPermission("sales.update");

  const parsed = parseInstallmentFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await installmentRepository.findById(id);
  if (!existing) return { error: "This installment no longer exists." };

  const updated = await installmentRepository.update(id, {
    contractId: fields.contractId,
    installmentNumber: fields.installmentNumber,
    dueDate: fields.dueDate,
    amount: { amount: fields.amount, currency: "BDT" },
    status: fields.status,
    paidDate: fields.paidDate,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This installment no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "installment.update", entityType: "Installment", entityId: id });

  revalidatePath("/admin/sales/installments");
  revalidatePath(`/admin/sales/installments/${id}`);
  redirect(`/admin/sales/installments/${id}`);
}

export async function deleteInstallment(id: string): Promise<void> {
  const user = await requireSalesPermission("sales.delete");

  const existing = await installmentRepository.findById(id);
  if (!existing) return;

  await installmentRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "installment.delete", entityType: "Installment", entityId: id });

  revalidatePath("/admin/sales/installments");
}
