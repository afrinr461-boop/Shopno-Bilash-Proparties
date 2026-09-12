"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { bookingRepository } from "@/features/sales/repository";
import { unitRepository } from "@/features/units/repository";
import { customerRepository } from "@/features/customers/repository";
import type { BookingStatus } from "@/types/sales";

export interface BookingFormState {
  error?: string;
}

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["reserved", "booked", "confirmed"];

async function requireSalesPermission(permission: "sales.create" | "sales.update" | "sales.delete") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

async function parseBookingFields(formData: FormData) {
  const unitId = String(formData.get("unitId") ?? "").trim();
  const customerId = String(formData.get("customerId") ?? "").trim();
  const bookingDate = String(formData.get("bookingDate") ?? "").trim();
  const bookingAmountRaw = String(formData.get("bookingAmount") ?? "");
  const agreedPriceRaw = String(formData.get("agreedPrice") ?? "");
  const discountRaw = String(formData.get("discount") ?? "").trim();
  const paymentTerms = String(formData.get("paymentTerms") ?? "").trim();
  const salespersonId = String(formData.get("salespersonId") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const expiryDate = String(formData.get("expiryDate") ?? "").trim();

  if (!unitId) return { error: "Choose a unit." } as const;
  const unit = await unitRepository.findById(unitId);
  if (!unit) return { error: "That unit no longer exists." } as const;
  if (!customerId) return { error: "Choose a customer." } as const;
  const customer = await customerRepository.findById(customerId);
  if (!customer) return { error: "That customer no longer exists." } as const;
  if (!bookingDate) return { error: "Enter a booking date." } as const;

  const bookingAmount = Number(bookingAmountRaw);
  if (!Number.isFinite(bookingAmount) || bookingAmount <= 0) return { error: "Enter a valid booking amount." } as const;
  const agreedPrice = Number(agreedPriceRaw);
  if (!Number.isFinite(agreedPrice) || agreedPrice <= 0) return { error: "Enter a valid agreed price." } as const;
  const discount = discountRaw ? Number(discountRaw) : undefined;

  return {
    fields: {
      unitId,
      customerId,
      bookingDate,
      bookingAmount,
      agreedPrice,
      discount: discount !== undefined && Number.isFinite(discount) ? discount : undefined,
      paymentTerms: paymentTerms || undefined,
      salespersonId: salespersonId || undefined,
      reference: reference || undefined,
      notes: notes || undefined,
      expiryDate: expiryDate || undefined,
    },
  } as const;
}

/**
 * Backend enforcement of Prompt 8 §4: "A booked unit must not be bookable
 * by another customer. Enforce this at backend/database level, not only
 * UI." This app's persistence layer is generic JSON-blob tables with no
 * DB-level unique/check constraints (`prisma/schema.prisma`), so the real
 * enforcement point is here, in the server action every booking write goes
 * through — not a client-side disabled state that a direct form post could
 * bypass.
 */
export async function createBooking(_prevState: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const user = await requireSalesPermission("sales.create");

  const parsed = await parseBookingFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const unit = await unitRepository.findById(fields.unitId);
  if (!unit) return { error: "That unit no longer exists." };
  if (unit.status !== "available") {
    return { error: `This unit is currently "${unit.status}" — only an available unit can be booked.` };
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await bookingRepository.create({
    id,
    projectId: unit.projectId,
    unitId: fields.unitId,
    customerId: fields.customerId,
    bookingDate: fields.bookingDate,
    bookingAmount: { amount: fields.bookingAmount, currency: "BDT" },
    agreedPrice: { amount: fields.agreedPrice, currency: "BDT" },
    discount: fields.discount !== undefined ? { amount: fields.discount, currency: "BDT" } : undefined,
    paymentTerms: fields.paymentTerms,
    status: "reserved",
    salespersonId: fields.salespersonId,
    reference: fields.reference,
    notes: fields.notes,
    expiryDate: fields.expiryDate,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await unitRepository.update(fields.unitId, { status: "reserved" });

  await recordAuditEvent({ actorUserId: user.id, action: "booking.create", entityType: "Booking", entityId: id });

  revalidatePath("/admin/sales/bookings");
  revalidatePath("/admin/properties");
  redirect("/admin/sales/bookings");
}

export async function updateBooking(id: string, _prevState: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const user = await requireSalesPermission("sales.update");

  const parsed = await parseBookingFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await bookingRepository.findById(id);
  if (!existing) return { error: "This booking no longer exists." };
  if (!ACTIVE_BOOKING_STATUSES.includes(existing.status)) {
    return { error: `This booking is "${existing.status}" and can no longer be edited.` };
  }

  const updated = await bookingRepository.update(id, {
    unitId: fields.unitId,
    customerId: fields.customerId,
    bookingDate: fields.bookingDate,
    bookingAmount: { amount: fields.bookingAmount, currency: "BDT" },
    agreedPrice: { amount: fields.agreedPrice, currency: "BDT" },
    discount: fields.discount !== undefined ? { amount: fields.discount, currency: "BDT" } : undefined,
    paymentTerms: fields.paymentTerms,
    salespersonId: fields.salespersonId,
    reference: fields.reference,
    notes: fields.notes,
    expiryDate: fields.expiryDate,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This booking no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "booking.update", entityType: "Booking", entityId: id });

  revalidatePath("/admin/sales/bookings");
  revalidatePath(`/admin/sales/bookings/${id}`);
  redirect(`/admin/sales/bookings/${id}`);
}

/** Marks a booking "confirmed" (still an active hold, not yet a Sale) — a lighter status step between reserved/booked and an actual conversion. */
export async function confirmBooking(id: string): Promise<{ error?: string }> {
  const user = await requireSalesPermission("sales.update");

  const existing = await bookingRepository.findById(id);
  if (!existing) return { error: "This booking no longer exists." };
  if (!ACTIVE_BOOKING_STATUSES.includes(existing.status)) return { error: `This booking is "${existing.status}".` };

  await bookingRepository.update(id, { status: "confirmed", updatedBy: user.id, updatedAt: new Date().toISOString() });
  await unitRepository.update(existing.unitId, { status: "booked" });

  await recordAuditEvent({ actorUserId: user.id, action: "booking.confirm", entityType: "Booking", entityId: id });

  revalidatePath("/admin/sales/bookings");
  revalidatePath(`/admin/sales/bookings/${id}`);
  return {};
}

/** Cancellation keeps the booking as history (Prompt 8 §4) — never deleted, just marked with a reason and the unit released back to available. */
export async function cancelBooking(id: string, reason: string): Promise<{ error?: string }> {
  const user = await requireSalesPermission("sales.update");

  if (!reason || reason.trim().length < 3) return { error: "Enter a cancellation reason (at least 3 characters)." };

  const existing = await bookingRepository.findById(id);
  if (!existing) return { error: "This booking no longer exists." };
  if (!ACTIVE_BOOKING_STATUSES.includes(existing.status)) return { error: `This booking is already "${existing.status}".` };

  const now = new Date().toISOString();
  await bookingRepository.update(id, {
    status: "cancelled",
    cancelledAt: now,
    cancelledReason: reason.trim(),
    updatedBy: user.id,
    updatedAt: now,
  });

  const unit = await unitRepository.findById(existing.unitId);
  if (unit && (unit.status === "reserved" || unit.status === "booked")) {
    await unitRepository.update(existing.unitId, { status: "available" });
  }

  await recordAuditEvent({ actorUserId: user.id, action: "booking.cancel", entityType: "Booking", entityId: id });

  revalidatePath("/admin/sales/bookings");
  revalidatePath(`/admin/sales/bookings/${id}`);
  revalidatePath("/admin/properties");
  return {};
}
