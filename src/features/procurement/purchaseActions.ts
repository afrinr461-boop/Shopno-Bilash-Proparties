"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { purchaseRepository, purchaseReceiptRepository, vendorRepository, materialRepository } from "@/features/procurement/repository";
import { projectRepository } from "@/features/projects/repository";
import type { PaymentStatus } from "@/types/procurement";

export interface PurchaseFormState {
  error?: string;
}

const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "partially-paid", "paid"];

function isPaymentStatus(value: string): value is PaymentStatus {
  return (PAYMENT_STATUSES as string[]).includes(value);
}

async function requireProcurementPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "procurement.manage")) throw new Error("Forbidden");
  return user;
}

async function parsePurchaseFields(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const vendorId = String(formData.get("vendorId") ?? "").trim();
  const materialId = String(formData.get("materialId") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "");
  const unitPriceRaw = String(formData.get("unitPrice") ?? "");
  const purchaseDate = String(formData.get("purchaseDate") ?? "").trim();
  const invoiceNumber = String(formData.get("invoiceNumber") ?? "").trim();
  const referenceNumber = String(formData.get("referenceNumber") ?? "").trim();
  const paymentStatus = String(formData.get("paymentStatus") ?? "");
  const constructionPhaseId = String(formData.get("constructionPhaseId") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!projectId) return { error: "Choose a project." } as const;
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." } as const;
  if (!vendorId) return { error: "Choose a supplier." } as const;
  const vendor = await vendorRepository.findById(vendorId);
  if (!vendor) return { error: "That supplier no longer exists." } as const;
  if (!materialId) return { error: "Choose a material." } as const;
  const material = await materialRepository.findById(materialId);
  if (!material) return { error: "That material no longer exists." } as const;
  if (!purchaseDate) return { error: "Enter a purchase date." } as const;
  if (!isPaymentStatus(paymentStatus)) return { error: "Choose a valid payment status." } as const;

  const quantity = Number(quantityRaw);
  if (!Number.isFinite(quantity) || quantity <= 0) return { error: "Enter a valid quantity." } as const;
  const unitPrice = Number(unitPriceRaw);
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return { error: "Enter a valid unit price." } as const;

  const total = Math.round(quantity * unitPrice * 100) / 100;

  return {
    fields: {
      projectId,
      vendorId,
      materialId,
      quantity,
      unit: material.unit,
      unitPrice,
      total,
      purchaseDate,
      invoiceNumber: invoiceNumber || undefined,
      referenceNumber: referenceNumber || undefined,
      paymentStatus,
      constructionPhaseId: constructionPhaseId || undefined,
      notes: notes || undefined,
    },
  } as const;
}

export async function createPurchase(_prevState: PurchaseFormState, formData: FormData): Promise<PurchaseFormState> {
  const user = await requireProcurementPermission();

  const parsed = await parsePurchaseFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await purchaseRepository.create({
    id,
    projectId: fields.projectId,
    vendorId: fields.vendorId,
    materialId: fields.materialId,
    quantity: fields.quantity,
    unit: fields.unit,
    unitPrice: { amount: fields.unitPrice, currency: "BDT" },
    total: { amount: fields.total, currency: "BDT" },
    purchaseDate: fields.purchaseDate,
    invoiceNumber: fields.invoiceNumber,
    referenceNumber: fields.referenceNumber,
    paymentStatus: fields.paymentStatus,
    status: "ordered",
    constructionPhaseId: fields.constructionPhaseId,
    notes: fields.notes,
    attachmentDocumentIds: [],
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "purchase.create", entityType: "Purchase", entityId: id });

  revalidatePath("/admin/procurement/purchases");
  redirect(`/admin/procurement/purchases/${id}`);
}

/**
 * Once any `PurchaseReceipt` exists against a purchase, its material/
 * quantity/project/vendor/price can no longer change — those receipts
 * snapshot the purchase's identity at receiving time, so editing them out
 * from under real inventory history would silently corrupt it. Payment
 * status, invoice/reference numbers, and notes stay editable regardless.
 */
export async function updatePurchase(
  id: string,
  _prevState: PurchaseFormState,
  formData: FormData,
): Promise<PurchaseFormState> {
  const user = await requireProcurementPermission();

  const existing = await purchaseRepository.findById(id);
  if (!existing) return { error: "This purchase no longer exists." };

  const receipts = (await purchaseReceiptRepository.list()).filter((r) => r.purchaseId === id);
  const locked = receipts.length > 0;

  const parsed = await parsePurchaseFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  if (locked && (fields.materialId !== existing.materialId || fields.quantity !== existing.quantity || fields.projectId !== existing.projectId || fields.vendorId !== existing.vendorId || fields.unitPrice !== existing.unitPrice?.amount)) {
    return { error: "This purchase already has receipts recorded against it — its material, quantity, project, supplier, and price can no longer change." };
  }

  const updated = await purchaseRepository.update(id, {
    projectId: fields.projectId,
    vendorId: fields.vendorId,
    materialId: fields.materialId,
    quantity: fields.quantity,
    unit: fields.unit,
    unitPrice: { amount: fields.unitPrice, currency: "BDT" },
    total: { amount: fields.total, currency: "BDT" },
    purchaseDate: fields.purchaseDate,
    invoiceNumber: fields.invoiceNumber,
    referenceNumber: fields.referenceNumber,
    paymentStatus: fields.paymentStatus,
    constructionPhaseId: fields.constructionPhaseId,
    notes: fields.notes,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This purchase no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "purchase.update", entityType: "Purchase", entityId: id });

  revalidatePath("/admin/procurement/purchases");
  revalidatePath(`/admin/procurement/purchases/${id}`);
  redirect(`/admin/procurement/purchases/${id}`);
}

export async function deletePurchase(id: string): Promise<{ error?: string }> {
  const user = await requireProcurementPermission();

  const existing = await purchaseRepository.findById(id);
  if (!existing) return {};

  const hasReceipts = (await purchaseReceiptRepository.list()).some((r) => r.purchaseId === id);
  if (hasReceipts) return { error: "Can't delete a purchase that already has receipts recorded — cancel it instead." };

  await purchaseRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "purchase.delete", entityType: "Purchase", entityId: id });

  revalidatePath("/admin/procurement/purchases");
  return {};
}

/** Cancels a purchase that hasn't been received against yet — once received (even partially), cancelling would leave stock that no longer traces to an active order, so it's blocked. */
export async function cancelPurchase(id: string): Promise<{ error?: string }> {
  const user = await requireProcurementPermission();

  const existing = await purchaseRepository.findById(id);
  if (!existing) return { error: "This purchase no longer exists." };
  if (existing.status === "cancelled") return {};

  const hasReceipts = (await purchaseReceiptRepository.list()).some((r) => r.purchaseId === id);
  if (hasReceipts) return { error: "Can't cancel a purchase that already has receipts recorded against it." };

  await purchaseRepository.update(id, { status: "cancelled", updatedBy: user.id, updatedAt: new Date().toISOString() });

  await recordAuditEvent({ actorUserId: user.id, action: "purchase.cancel", entityType: "Purchase", entityId: id });

  revalidatePath("/admin/procurement/purchases");
  revalidatePath(`/admin/procurement/purchases/${id}`);
  return {};
}
