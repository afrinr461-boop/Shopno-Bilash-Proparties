"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { notificationRepository } from "@/features/notifications/repository";
import { userRepository } from "@/features/users/repository";
import { getProjectOwnerRecipients } from "@/features/notifications/recipients";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/fileStorage";
import type { NotificationChannel, NotificationEvent, NotificationCategory, NotificationPriority } from "@/types/notification";

export interface NotificationFormState {
  error?: string;
}

const NOTIFICATION_EVENTS: NotificationEvent[] = [
  "payment.received",
  "payment.due",
  "payment.overdue",
  "booking.confirmed",
  "document.uploaded",
  "construction.milestone-reached",
  "project.updated",
  "lead.new-inquiry",
  "lead.follow-up-reminder",
  "approval.requested",
];
const NOTIFICATION_CHANNELS: NotificationChannel[] = ["in-app", "email", "sms", "whatsapp"];
const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "finance", "construction", "sales", "crm", "document", "inventory", "system", "security", "approval", "reminder",
];
const NOTIFICATION_PRIORITIES: NotificationPriority[] = ["low", "medium", "high", "critical"];

function isNotificationEvent(value: string): value is NotificationEvent {
  return (NOTIFICATION_EVENTS as string[]).includes(value);
}
function isNotificationChannel(value: string): value is NotificationChannel {
  return (NOTIFICATION_CHANNELS as string[]).includes(value);
}

async function requireNotificationsPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "notifications.manage")) throw new Error("Forbidden");
  return user;
}

/** A file input with nothing chosen still shows up in FormData as an empty File — treat that as "no file". */
function getUploadedImage(formData: FormData): File | null {
  const file = formData.get("image");
  return file instanceof File && file.size > 0 ? file : null;
}

async function parseNotificationFields(formData: FormData, options: { requireRecipient: boolean }) {
  const sendMode = String(formData.get("sendMode") ?? "one") === "all" ? "all" : "one";
  const recipientUserId = String(formData.get("recipientUserId") ?? "").trim();
  const event = String(formData.get("event") ?? "");
  const channel = String(formData.get("channel") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const relatedEntityId = String(formData.get("relatedEntityId") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priority = String(formData.get("priority") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const actionHref = String(formData.get("actionHref") ?? "").trim();

  if (sendMode === "all") {
    if (!projectId) return { error: "Choose which project's owners should receive this." } as const;
  } else if (options.requireRecipient) {
    if (!recipientUserId) return { error: "Choose a recipient." } as const;
    const recipient = await userRepository.findById(recipientUserId);
    if (!recipient) return { error: "That user no longer exists." } as const;
  }
  if (!isNotificationEvent(event)) return { error: "Choose a valid event." } as const;
  if (!isNotificationChannel(channel)) return { error: "Choose a valid channel." } as const;
  if (!title || title.length < 2) return { error: "Enter a title." } as const;
  if (!body || body.length < 2) return { error: "Enter a message." } as const;
  if (category && !(NOTIFICATION_CATEGORIES as string[]).includes(category)) return { error: "Choose a valid category." } as const;
  if (priority && !(NOTIFICATION_PRIORITIES as string[]).includes(priority)) return { error: "Choose a valid priority." } as const;

  return {
    fields: {
      sendMode,
      recipientUserId,
      event,
      channel,
      title,
      body,
      relatedEntityId: relatedEntityId || undefined,
      category: (category || undefined) as NotificationCategory | undefined,
      priority: (priority || undefined) as NotificationPriority | undefined,
      projectId: projectId || undefined,
      actionHref: actionHref || undefined,
    },
  } as const;
}

export async function createNotification(
  _prevState: NotificationFormState,
  formData: FormData,
): Promise<NotificationFormState> {
  const user = await requireNotificationsPermission();

  const parsed = await parseNotificationFields(formData, { requireRecipient: true });
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const imageFile = getUploadedImage(formData);
  let imageUrl: string | undefined;
  if (imageFile) {
    try {
      imageUrl = (await saveUploadedFile(imageFile, "notifications")).url;
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Couldn't save that image." };
    }
  }

  const now = new Date().toISOString();
  const base = {
    event: fields.event,
    channel: fields.channel,
    title: fields.title,
    body: fields.body,
    relatedEntityId: fields.relatedEntityId,
    category: fields.category,
    priority: fields.priority,
    projectId: fields.projectId,
    actionHref: fields.actionHref,
    imageUrl,
    actorUserId: user.id,
    status: "unread" as const,
    createdAt: now,
  };

  if (fields.sendMode === "all") {
    // fields.projectId is guaranteed set here — parseNotificationFields requires it for sendMode "all".
    const { recipients, unreachableCount } = await getProjectOwnerRecipients(fields.projectId!);
    if (recipients.length === 0) {
      return { error: "No unit owners with an active portal account exist for this project yet." };
    }

    await Promise.all(recipients.map((r) => notificationRepository.create({ id: randomUUID(), recipientUserId: r.userId, ...base })));

    await recordAuditEvent({
      actorUserId: user.id,
      action: "notification.broadcast",
      entityType: "Notification",
      entityId: fields.projectId!,
      projectId: fields.projectId,
    });

    revalidatePath("/admin/notifications");
    redirect(`/admin/notifications?sent=${recipients.length}&skipped=${unreachableCount}`);
  }

  const id = randomUUID();
  await notificationRepository.create({ id, recipientUserId: fields.recipientUserId, ...base });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "notification.create",
    entityType: "Notification",
    entityId: id,
    projectId: fields.projectId,
  });

  revalidatePath("/admin/notifications");
  redirect("/admin/notifications");
}

export async function updateNotification(
  id: string,
  _prevState: NotificationFormState,
  formData: FormData,
): Promise<NotificationFormState> {
  const user = await requireNotificationsPermission();

  const parsed = await parseNotificationFields(formData, { requireRecipient: true });
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await notificationRepository.findById(id);
  if (!existing) return { error: "This notification no longer exists." };

  let imageUrl = existing.imageUrl;
  const imageFile = getUploadedImage(formData);
  if (imageFile) {
    try {
      imageUrl = (await saveUploadedFile(imageFile, "notifications")).url;
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Couldn't save that image." };
    }
    if (existing.imageUrl) await deleteUploadedFile(existing.imageUrl);
  }

  const updated = await notificationRepository.update(id, {
    recipientUserId: fields.recipientUserId,
    event: fields.event,
    channel: fields.channel,
    title: fields.title,
    body: fields.body,
    relatedEntityId: fields.relatedEntityId,
    category: fields.category,
    priority: fields.priority,
    projectId: fields.projectId,
    actionHref: fields.actionHref,
    imageUrl,
  });
  if (!updated) return { error: "This notification no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "notification.update", entityType: "Notification", entityId: id });

  revalidatePath("/admin/notifications");
  revalidatePath(`/admin/notifications/${id}`);
  redirect(`/admin/notifications/${id}`);
}

/** Prompt 9 §2 — unread → read → archived. Any signed-in user can mark their own notification read/archived (no `notifications.manage` needed — that permission gates creating/editing notification records on others' behalf, not a recipient managing their own inbox). */
export async function markNotificationRead(id: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await notificationRepository.findById(id);
  if (!existing) return { error: "This notification no longer exists." };
  if (existing.recipientUserId !== user.id) return { error: "This notification isn't yours." };

  await notificationRepository.update(id, { status: "read", readAt: new Date().toISOString() });

  revalidatePath("/admin/notifications");
  return {};
}

export async function archiveNotification(id: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await notificationRepository.findById(id);
  if (!existing) return { error: "This notification no longer exists." };
  if (existing.recipientUserId !== user.id) return { error: "This notification isn't yours." };

  await notificationRepository.update(id, { status: "archived", archivedAt: new Date().toISOString() });

  revalidatePath("/admin/notifications");
  return {};
}

export async function deleteNotification(id: string): Promise<void> {
  const user = await requireNotificationsPermission();

  const existing = await notificationRepository.findById(id);
  if (!existing) return;

  if (existing.imageUrl) await deleteUploadedFile(existing.imageUrl);
  await notificationRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "notification.delete", entityType: "Notification", entityId: id });

  revalidatePath("/admin/notifications");
}
