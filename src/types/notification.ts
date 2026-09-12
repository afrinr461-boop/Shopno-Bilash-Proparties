import type { ID } from "./common";

export type NotificationEvent =
  | "payment.received"
  | "payment.due"
  | "payment.overdue"
  | "booking.confirmed"
  | "document.uploaded"
  | "construction.milestone-reached"
  | "project.updated"
  | "lead.new-inquiry"
  | "lead.follow-up-reminder"
  | "approval.requested";

export type NotificationChannel = "in-app" | "email" | "sms" | "whatsapp";

/** Prompt 9 §2. */
export type NotificationCategory =
  | "finance"
  | "construction"
  | "sales"
  | "crm"
  | "document"
  | "inventory"
  | "system"
  | "security"
  | "approval"
  | "reminder";

export type NotificationPriority = "low" | "medium" | "high" | "critical";
export type NotificationStatus = "unread" | "read" | "archived";

export interface Notification {
  id: ID;
  recipientUserId: ID;
  event: NotificationEvent;
  channel: NotificationChannel;
  title: string;
  body: string;
  relatedEntityId?: ID;
  readAt?: string;
  createdAt: string;
  /** Prompt 9 §2 additions — all optional so every notification created before this step still reads fine (absent category/priority/status render as "system"/"medium"/"unread" at the UI layer, see `lib/notificationDefaults.ts`). */
  category?: NotificationCategory;
  priority?: NotificationPriority;
  projectId?: ID;
  relatedEntityType?: string;
  /** Deep link to the record this notification is about — clicking the notification navigates here (Prompt 9 §2). */
  actionHref?: string;
  actorUserId?: ID;
  status?: NotificationStatus;
  archivedAt?: string;
  /** Optional photo/attachment shown alongside the message (e.g. a site-progress photo on an announcement) — a `/uploads/notifications/...` path from `saveUploadedFile`, same convention as `Document.fileUrl`. */
  imageUrl?: string;
}

/**
 * A channel implements this to plug into the notification dispatcher.
 * Concrete providers (SES/Resend for email, Twilio for SMS/WhatsApp) are a
 * future integration — see ARCHITECTURE.md §16.
 */
export interface NotificationProvider {
  channel: NotificationChannel;
  send(notification: Notification): Promise<void>;
}
