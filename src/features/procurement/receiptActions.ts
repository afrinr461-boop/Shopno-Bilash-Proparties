"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { purchaseRepository, purchaseReceiptRepository, stockMovementRepository } from "@/features/procurement/repository";
import { derivePurchaseReceivingState } from "@/lib/materialStock";

export interface ReceiptFormState {
  error?: string;
}

async function requireProcurementPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "procurement.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * Records the physical receipt of goods against a purchase, and — this is
 * the step that actually moves stock — creates the matching `StockMovement`
 * in the same call. A `Purchase` on its own never touches inventory; only a
 * receipt does, and only for the quantity actually received. Refuses to let
 * cumulative receipts exceed what was ordered — a real over-delivery should
 * be handled as a new purchase, not silently absorbed here.
 */
export async function recordPurchaseReceipt(
  purchaseId: string,
  _prevState: ReceiptFormState,
  formData: FormData,
): Promise<ReceiptFormState> {
  const user = await requireProcurementPermission();

  const purchase = await purchaseRepository.findById(purchaseId);
  if (!purchase) return { error: "This purchase no longer exists." };
  if (purchase.status === "cancelled") return { error: "This purchase is cancelled — nothing to receive." };
  if (!purchase.materialId || purchase.quantity === undefined || !purchase.unit) {
    return { error: "This purchase predates per-material tracking and has no material or quantity to receive against." };
  }

  const receivedDate = String(formData.get("receivedDate") ?? "").trim();
  const quantityRaw = String(formData.get("quantityReceived") ?? "");
  const batchNumber = String(formData.get("batchNumber") ?? "").trim();
  const deliveryNote = String(formData.get("deliveryNote") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!receivedDate) return { error: "Enter the received date." };
  const quantityReceived = Number(quantityRaw);
  if (!Number.isFinite(quantityReceived) || quantityReceived <= 0) return { error: "Enter a valid received quantity." };

  const existingReceipts = (await purchaseReceiptRepository.list()).filter((r) => r.purchaseId === purchaseId);
  const alreadyReceived = existingReceipts.reduce((s, r) => s + r.quantityReceived, 0);
  const { remainingQuantity } = derivePurchaseReceivingState(purchase, alreadyReceived);
  if (quantityReceived > remainingQuantity) {
    return { error: `Only ${remainingQuantity} ${purchase.unit} remain to be received on this purchase — enter ${remainingQuantity} or less.` };
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await purchaseReceiptRepository.create({
    id,
    purchaseId,
    projectId: purchase.projectId,
    materialId: purchase.materialId,
    vendorId: purchase.vendorId,
    receivedDate,
    quantityReceived,
    batchNumber: batchNumber || undefined,
    deliveryNote: deliveryNote || undefined,
    notes: notes || undefined,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await stockMovementRepository.create({
    id: randomUUID(),
    projectId: purchase.projectId,
    materialId: purchase.materialId,
    type: "received",
    quantity: quantityReceived,
    date: receivedDate,
    reference: purchase.invoiceNumber ?? purchase.referenceNumber,
    notes: `Receipt against purchase ${purchase.id}${batchNumber ? ` — batch ${batchNumber}` : ""}`,
    purchaseId,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "purchaseReceipt.create", entityType: "PurchaseReceipt", entityId: id });

  revalidatePath(`/admin/procurement/purchases/${purchaseId}`);
  revalidatePath("/admin/procurement/stock");
  return {};
}
