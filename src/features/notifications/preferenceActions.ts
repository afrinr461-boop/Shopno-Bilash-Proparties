"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { notificationPreferenceRepository } from "@/features/notifications/repository";
import type { NotificationCategory } from "@/types/notification";
import type { NotificationMode } from "@/types/notificationPreference";

export interface PreferenceFormState {
  error?: string;
}

const CATEGORIES: NotificationCategory[] = [
  "finance",
  "construction",
  "sales",
  "crm",
  "document",
  "inventory",
  "system",
  "security",
  "approval",
  "reminder",
];
const MODES: NotificationMode[] = ["all", "important-only", "custom"];

/** Prompt 9 §13 — every signed-in user manages only their own preferences; no admin-on-behalf-of-others UI (kept out of scope, same discipline as everywhere else in this app not over-building). */
export async function updateNotificationPreferences(_prevState: PreferenceFormState, formData: FormData): Promise<PreferenceFormState> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const mode = String(formData.get("mode") ?? "all");
  if (!(MODES as string[]).includes(mode)) return { error: "Choose a valid mode." };

  const enabledCategories = CATEGORIES.filter((c) => formData.get(`category:${c}`) === "on");
  const inAppEnabled = formData.get("inAppEnabled") === "on";
  const emailEnabled = formData.get("emailEnabled") === "on";
  const reminderNotificationsEnabled = formData.get("reminderNotificationsEnabled") === "on";

  const existing = await notificationPreferenceRepository.list().then((all) => all.find((p) => p.userId === user.id));
  const now = new Date().toISOString();

  if (existing) {
    await notificationPreferenceRepository.update(existing.id, {
      mode: mode as NotificationMode,
      enabledCategories,
      inAppEnabled,
      emailEnabled,
      reminderNotificationsEnabled,
      updatedBy: user.id,
      updatedAt: now,
    });
  } else {
    await notificationPreferenceRepository.create({
      id: randomUUID(),
      userId: user.id,
      mode: mode as NotificationMode,
      enabledCategories,
      inAppEnabled,
      emailEnabled,
      reminderNotificationsEnabled,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
    });
  }

  revalidatePath("/admin/settings/notifications");
  return {};
}
