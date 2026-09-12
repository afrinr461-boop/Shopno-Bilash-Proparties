import type { AuditFields, ID } from "./common";
import type { NotificationCategory } from "./notification";

export type NotificationMode = "all" | "important-only" | "custom";

/**
 * Prompt 9 §13 — one row per user. `enabledCategories` only matters when
 * `mode` is "custom"; "all"/"important-only" are computed rules, not a
 * stored category list, so switching back to "all" doesn't lose whatever
 * was previously checked. Email/SMS/WhatsApp toggles exist here so the UI
 * has somewhere to put them, but only `inAppEnabled` is ever actually
 * consulted — no email/SMS infrastructure exists yet (`types/notification.ts`'s
 * `NotificationProvider` is still just an interface), so those toggles are
 * presentational ("Coming soon"), never wired to a real send path.
 */
export interface NotificationPreference extends AuditFields {
  id: ID;
  userId: ID;
  mode: NotificationMode;
  enabledCategories: NotificationCategory[];
  inAppEnabled: boolean;
  emailEnabled: boolean;
  reminderNotificationsEnabled: boolean;
}
