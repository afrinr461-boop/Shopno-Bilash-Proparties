"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { companySettingsRepository, COMPANY_SETTINGS_ID } from "@/features/settings/repository";

export interface SettingsFormState {
  error?: string;
}

/** Prompt 9 §14 — the first edit path for `CompanySettings` (Admin Step 20 shipped it read-only). Still a singleton: no create/delete, just update the one real row. */
export async function updateCompanySettings(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "settings.manage")) throw new Error("Forbidden");

  const legalName = String(formData.get("legalName") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const dateFormat = String(formData.get("dateFormat") ?? "").trim();
  const timeZone = String(formData.get("timeZone") ?? "").trim();
  const defaultLowStockThresholdRaw = String(formData.get("defaultLowStockThreshold") ?? "").trim();
  const reminderLeadDaysRaw = String(formData.get("reminderLeadDays") ?? "").trim();

  if (!legalName || legalName.length < 2) return { error: "Enter a legal name." };
  if (!displayName || displayName.length < 2) return { error: "Enter a display name." };

  const defaultLowStockThreshold = defaultLowStockThresholdRaw ? Number(defaultLowStockThresholdRaw) : undefined;
  const reminderLeadDays = reminderLeadDaysRaw ? Number(reminderLeadDaysRaw) : undefined;

  const existing = await companySettingsRepository.findById(COMPANY_SETTINGS_ID);
  if (!existing) return { error: "Settings record is missing." };

  await companySettingsRepository.update(COMPANY_SETTINGS_ID, {
    legalName,
    displayName,
    address: address || undefined,
    phone: phone || undefined,
    email: email || undefined,
    website: website || undefined,
    dateFormat: dateFormat || undefined,
    timeZone: timeZone || undefined,
    defaultLowStockThreshold: Number.isFinite(defaultLowStockThreshold) ? defaultLowStockThreshold : undefined,
    reminderLeadDays: Number.isFinite(reminderLeadDays) ? reminderLeadDays : undefined,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });

  await recordAuditEvent({ actorUserId: user.id, action: "settings.update", entityType: "CompanySettings", entityId: COMPANY_SETTINGS_ID });

  revalidatePath("/admin/settings");
  redirect("/admin/settings");
}
