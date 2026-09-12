"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { reminderRepository } from "@/features/reminders/repository";
import { projectRepository } from "@/features/projects/repository";
import type { ReminderPriority, ReminderRepeatRule } from "@/types/reminder";

export interface ReminderFormState {
  error?: string;
}

const PRIORITIES: ReminderPriority[] = ["low", "medium", "high", "critical"];
const REPEAT_RULES: ReminderRepeatRule[] = ["none", "daily", "weekly", "monthly"];

function isPriority(v: string): v is ReminderPriority {
  return (PRIORITIES as string[]).includes(v);
}
function isRepeatRule(v: string): v is ReminderRepeatRule {
  return (REPEAT_RULES as string[]).includes(v);
}

async function requireRemindersPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "reminders.manage")) throw new Error("Forbidden");
  return user;
}

async function parseReminderFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium");
  const projectId = String(formData.get("projectId") ?? "").trim();
  const relatedEntity = String(formData.get("relatedEntity") ?? "").trim();
  const assignedUserId = String(formData.get("assignedUserId") ?? "").trim();
  const repeatRule = String(formData.get("repeatRule") ?? "none");

  if (!title || title.length < 2) return { error: "Enter a title." } as const;
  if (!date) return { error: "Enter a date." } as const;
  if (!isPriority(priority)) return { error: "Choose a valid priority." } as const;
  if (!isRepeatRule(repeatRule)) return { error: "Choose a valid repeat rule." } as const;
  if (projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) return { error: "That project no longer exists." } as const;
  }

  return {
    fields: {
      title,
      description: description || undefined,
      date,
      time: time || undefined,
      priority,
      projectId: projectId || undefined,
      relatedEntity: relatedEntity || undefined,
      assignedUserId: assignedUserId || undefined,
      repeatRule,
    },
  } as const;
}

export async function createReminder(_prevState: ReminderFormState, formData: FormData): Promise<ReminderFormState> {
  const user = await requireRemindersPermission();

  const parsed = await parseReminderFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await reminderRepository.create({
    id,
    ...fields,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "reminder.create",
    entityType: "Reminder",
    entityId: id,
    projectId: fields.projectId,
  });

  revalidatePath("/admin/reminders");
  redirect("/admin/reminders");
}

export async function updateReminder(id: string, _prevState: ReminderFormState, formData: FormData): Promise<ReminderFormState> {
  const user = await requireRemindersPermission();

  const parsed = await parseReminderFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await reminderRepository.findById(id);
  if (!existing) return { error: "This reminder no longer exists." };

  const updated = await reminderRepository.update(id, { ...fields, updatedBy: user.id, updatedAt: new Date().toISOString() });
  if (!updated) return { error: "This reminder no longer exists." };

  await recordAuditEvent({
    actorUserId: user.id,
    action: "reminder.update",
    entityType: "Reminder",
    entityId: id,
    projectId: fields.projectId,
  });

  revalidatePath("/admin/reminders");
  revalidatePath(`/admin/reminders/${id}`);
  redirect(`/admin/reminders/${id}`);
}

export async function completeReminder(id: string): Promise<{ error?: string }> {
  const user = await requireRemindersPermission();

  const existing = await reminderRepository.findById(id);
  if (!existing) return { error: "This reminder no longer exists." };

  const now = new Date().toISOString();
  await reminderRepository.update(id, { status: "completed", completedDate: now, updatedBy: user.id, updatedAt: now });

  await recordAuditEvent({ actorUserId: user.id, action: "reminder.complete", entityType: "Reminder", entityId: id, projectId: existing.projectId });

  revalidatePath("/admin/reminders");
  return {};
}

export async function dismissReminder(id: string): Promise<{ error?: string }> {
  const user = await requireRemindersPermission();

  const existing = await reminderRepository.findById(id);
  if (!existing) return { error: "This reminder no longer exists." };

  await reminderRepository.update(id, { status: "dismissed", updatedBy: user.id, updatedAt: new Date().toISOString() });

  await recordAuditEvent({ actorUserId: user.id, action: "reminder.dismiss", entityType: "Reminder", entityId: id, projectId: existing.projectId });

  revalidatePath("/admin/reminders");
  return {};
}

export async function deleteReminder(id: string): Promise<void> {
  const user = await requireRemindersPermission();

  const existing = await reminderRepository.findById(id);
  if (!existing) return;

  await reminderRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "reminder.delete", entityType: "Reminder", entityId: id, projectId: existing.projectId });

  revalidatePath("/admin/reminders");
}
