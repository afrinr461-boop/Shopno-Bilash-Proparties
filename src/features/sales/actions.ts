"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { saleRepository, bookingRepository } from "@/features/sales/repository";
import { unitRepository } from "@/features/units/repository";
import { customerRepository } from "@/features/customers/repository";
import { openOwnershipRecord, closeOwnershipRecord } from "@/features/ownership/writeThrough";
import type { DiscountType, SaleStatus } from "@/types/sales";

export interface SaleFormState {
  error?: string;
}

const SALE_STATUSES: SaleStatus[] = ["pending", "confirmed", "completed", "cancelled"];
function isSaleStatus(value: string): value is SaleStatus {
  return (SALE_STATUSES as string[]).includes(value);
}

async function requireSalesPermission(permission: "sales.create" | "sales.update" | "sales.delete") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

function toOptionalMoney(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

async function parseSaleFields(formData: FormData) {
  const unitId = String(formData.get("unitId") ?? "").trim();
  const customerId = String(formData.get("customerId") ?? "").trim();
  const saleDate = String(formData.get("saleDate") ?? "").trim();
  const basePriceRaw = String(formData.get("basePrice") ?? "");
  const floorPremiumRaw = String(formData.get("floorPremium") ?? "");
  const parkingPriceRaw = String(formData.get("parkingPrice") ?? "");
  const additionalChargesRaw = String(formData.get("additionalCharges") ?? "");
  const discountAmountRaw = String(formData.get("discountAmount") ?? "");
  const discountType = String(formData.get("discountType") ?? "").trim();
  const discountReason = String(formData.get("discountReason") ?? "").trim();
  const paymentTerms = String(formData.get("paymentTerms") ?? "").trim();
  const salespersonId = String(formData.get("salespersonId") ?? "").trim();
  const status = String(formData.get("status") ?? "completed");
  const bookingId = String(formData.get("bookingId") ?? "").trim();

  if (!unitId) return { error: "Choose a unit." } as const;
  const unit = await unitRepository.findById(unitId);
  if (!unit) return { error: "That unit no longer exists." } as const;
  if (!customerId) return { error: "Choose a customer." } as const;
  const customer = await customerRepository.findById(customerId);
  if (!customer) return { error: "That customer no longer exists." } as const;
  if (!saleDate) return { error: "Enter a sale date." } as const;

  const basePrice = Number(basePriceRaw);
  if (!Number.isFinite(basePrice) || basePrice <= 0) return { error: "Enter a valid base price." } as const;
  if (!isSaleStatus(status)) return { error: "Choose a valid status." } as const;

  const floorPremium = toOptionalMoney(floorPremiumRaw) ?? 0;
  const parkingPrice = toOptionalMoney(parkingPriceRaw) ?? 0;
  const additionalCharges = toOptionalMoney(additionalChargesRaw) ?? 0;
  const discountAmountRawNum = toOptionalMoney(discountAmountRaw) ?? 0;
  const discountAmount = discountType === "percentage" ? (basePrice * discountAmountRawNum) / 100 : discountAmountRawNum;
  const salePrice = Math.max(0, basePrice + floorPremium + parkingPrice + additionalCharges - discountAmount);

  return {
    fields: {
      unitId,
      customerId,
      saleDate,
      basePrice,
      floorPremium: toOptionalMoney(floorPremiumRaw),
      parkingPrice: toOptionalMoney(parkingPriceRaw),
      additionalCharges: toOptionalMoney(additionalChargesRaw),
      discountAmount: discountAmountRawNum > 0 ? discountAmountRawNum : undefined,
      discountType: (discountType || undefined) as DiscountType | undefined,
      discountReason: discountReason || undefined,
      salePrice,
      paymentTerms: paymentTerms || undefined,
      salespersonId: salespersonId || undefined,
      status,
      bookingId: bookingId || undefined,
    },
  } as const;
}

export async function createSale(_prevState: SaleFormState, formData: FormData): Promise<SaleFormState> {
  const user = await requireSalesPermission("sales.create");

  const parsed = await parseSaleFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();
  const unit = await unitRepository.findById(fields.unitId);
  if (!unit) return { error: "That unit no longer exists." };

  await saleRepository.create({
    id,
    projectId: unit.projectId,
    unitId: fields.unitId,
    customerId: fields.customerId,
    saleDate: fields.saleDate,
    basePrice: { amount: fields.basePrice, currency: "BDT" },
    floorPremium: fields.floorPremium !== undefined ? { amount: fields.floorPremium, currency: "BDT" } : undefined,
    parkingPrice: fields.parkingPrice !== undefined ? { amount: fields.parkingPrice, currency: "BDT" } : undefined,
    additionalCharges: fields.additionalCharges !== undefined ? { amount: fields.additionalCharges, currency: "BDT" } : undefined,
    discountAmount: fields.discountAmount !== undefined ? { amount: fields.discountAmount, currency: "BDT" } : undefined,
    discountType: fields.discountType,
    discountReason: fields.discountReason,
    salePrice: { amount: fields.salePrice, currency: "BDT" },
    paymentTerms: fields.paymentTerms,
    salespersonId: fields.salespersonId,
    status: fields.status,
    bookingId: fields.bookingId,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  // A sold unit shouldn't still read "Available" — matches what recording
  // a sale actually means, the same way the unit detail page already shows
  // a `customerId` field for exactly this kind of allocation.
  await unitRepository.update(fields.unitId, { status: "sold", customerId: fields.customerId });

  await openOwnershipRecord({
    targetType: "unit",
    targetId: fields.unitId,
    projectId: unit.projectId,
    ownerType: "customer",
    ownerId: fields.customerId,
    source: "sale",
    sourceRecordId: id,
    startDate: fields.saleDate,
    actorUserId: user.id,
  });

  // Prompt 8 §4 — booking history stays unchanged after conversion, this
  // only flips its status/back-link, never rewrites its original terms.
  if (fields.bookingId) {
    const booking = await bookingRepository.findById(fields.bookingId);
    if (booking) {
      await bookingRepository.update(fields.bookingId, { status: "converted", convertedSaleId: id, updatedBy: user.id, updatedAt: now });
    }
  }

  await recordAuditEvent({ actorUserId: user.id, action: "sale.create", entityType: "Sale", entityId: id });

  revalidatePath("/admin/sales");
  revalidatePath("/admin/sales/bookings");
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${fields.unitId}`);
  redirect("/admin/sales");
}

export async function updateSale(id: string, _prevState: SaleFormState, formData: FormData): Promise<SaleFormState> {
  const user = await requireSalesPermission("sales.update");

  const parsed = await parseSaleFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await saleRepository.findById(id);
  if (!existing) return { error: "This sale no longer exists." };

  const updated = await saleRepository.update(id, {
    unitId: fields.unitId,
    customerId: fields.customerId,
    saleDate: fields.saleDate,
    basePrice: { amount: fields.basePrice, currency: "BDT" },
    floorPremium: fields.floorPremium !== undefined ? { amount: fields.floorPremium, currency: "BDT" } : undefined,
    parkingPrice: fields.parkingPrice !== undefined ? { amount: fields.parkingPrice, currency: "BDT" } : undefined,
    additionalCharges: fields.additionalCharges !== undefined ? { amount: fields.additionalCharges, currency: "BDT" } : undefined,
    discountAmount: fields.discountAmount !== undefined ? { amount: fields.discountAmount, currency: "BDT" } : undefined,
    discountType: fields.discountType,
    discountReason: fields.discountReason,
    salePrice: { amount: fields.salePrice, currency: "BDT" },
    paymentTerms: fields.paymentTerms,
    salespersonId: fields.salespersonId,
    status: fields.status,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This sale no longer exists." };

  // If the sale now points at a different unit, keep both units honest —
  // the old one is no longer sold via this sale, the new one is.
  if (existing.unitId !== fields.unitId) {
    await unitRepository.update(existing.unitId, { status: "available", customerId: undefined });
  }
  if (fields.status === "cancelled") {
    await unitRepository.update(fields.unitId, { status: "available", customerId: undefined });
    await closeOwnershipRecord("unit", fields.unitId);
  } else {
    await unitRepository.update(fields.unitId, { status: "sold", customerId: fields.customerId });
  }

  if (existing.unitId !== fields.unitId || existing.customerId !== fields.customerId) {
    await closeOwnershipRecord("unit", existing.unitId);
    const unit = await unitRepository.findById(fields.unitId);
    if (unit && fields.status !== "cancelled") {
      await openOwnershipRecord({
        targetType: "unit",
        targetId: fields.unitId,
        projectId: unit.projectId,
        ownerType: "customer",
        ownerId: fields.customerId,
        source: "sale",
        sourceRecordId: id,
        startDate: fields.saleDate,
        actorUserId: user.id,
      });
    }
  }

  await recordAuditEvent({ actorUserId: user.id, action: "sale.update", entityType: "Sale", entityId: id });

  revalidatePath("/admin/sales");
  revalidatePath(`/admin/sales/${id}`);
  revalidatePath("/admin/properties");
  redirect(`/admin/sales/${id}`);
}

export async function deleteSale(id: string): Promise<void> {
  const user = await requireSalesPermission("sales.delete");

  const existing = await saleRepository.findById(id);
  if (!existing) return;

  await saleRepository.remove(id);

  // Deleting the sale record un-sells the unit — otherwise the unit stays
  // permanently "Sold" with no sale behind it, a worse inconsistency than
  // the delete itself.
  await unitRepository.update(existing.unitId, { status: "available", customerId: undefined });
  await closeOwnershipRecord("unit", existing.unitId);

  await recordAuditEvent({ actorUserId: user.id, action: "sale.delete", entityType: "Sale", entityId: id });

  revalidatePath("/admin/sales");
  revalidatePath("/admin/properties");
}
