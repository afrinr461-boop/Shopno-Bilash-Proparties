"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { notificationRepository } from "@/features/notifications/repository";
import { customerRepository } from "@/features/customers/repository";
import { shareholderRepository } from "@/features/shareholders/repository";
import { landownerRepository } from "@/features/landowners/repository";
import { getOwnerContributionsReport } from "@/features/reports/ownerContributions";
import { formatBDT, formatDate } from "@/lib/format";
import type { OwnerType } from "@/types/finance/costAllocation";

export interface SendOverdueNoticesResult {
  sent: number;
  alreadyNotified: number;
  noPortalAccount: number;
}

async function resolveOwnerUserId(ownerType: OwnerType, ownerId: string): Promise<string | undefined> {
  if (ownerType === "customer") return (await customerRepository.findById(ownerId))?.userId;
  if (ownerType === "shareholder") return (await shareholderRepository.findById(ownerId))?.userId;
  return (await landownerRepository.findById(ownerId))?.userId;
}

/**
 * The manual stand-in for a scheduled job — this codebase has no cron
 * infrastructure anywhere, so "automatic" overdue notifications means an
 * admin clicks this to run the check now, rather than a background
 * process running it silently. Safe to click repeatedly: a contribution
 * that already has a `payment.overdue` notification is skipped, not
 * re-notified every time.
 */
export async function sendOverdueNotices(): Promise<SendOverdueNoticesResult> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "notifications.manage")) throw new Error("Forbidden");

  // `notifications.manage` is only granted to super_admin/managing_director today (see
  // `ROLE_PERMISSIONS`), both of which see "all" projects — so this is already a
  // company-wide sweep in practice, not accidentally scoped to the caller's own projects.
  const [report, existingNotifications] = await Promise.all([
    getOwnerContributionsReport(user),
    notificationRepository.list(),
  ]);
  const alreadyNotifiedContributionIds = new Set(
    existingNotifications.filter((n) => n.event === "payment.overdue" && n.relatedEntityId).map((n) => n.relatedEntityId),
  );

  let sent = 0;
  let alreadyNotified = 0;
  let noPortalAccount = 0;

  for (const row of report.outstandingRows) {
    if (row.status !== "overdue") continue;
    if (alreadyNotifiedContributionIds.has(row.contribution.id)) {
      alreadyNotified += 1;
      continue;
    }

    const recipientUserId = await resolveOwnerUserId(row.contribution.ownerType, row.contribution.ownerId);
    if (!recipientUserId) {
      noPortalAccount += 1;
      continue;
    }

    const id = randomUUID();
    await notificationRepository.create({
      id,
      recipientUserId,
      event: "payment.overdue",
      channel: "in-app",
      title: `Payment overdue — ${row.allocation.title}`,
      body: `${formatBDT(row.outstanding)} was due on ${formatDate(new Date(row.contribution.dueDate))} for "${row.allocation.title}"${row.fineAmount > 0 ? `, plus a fine of ${formatBDT(row.fineAmount)}` : ""}. Total due: ${formatBDT(row.totalDue)}.`,
      relatedEntityId: row.contribution.id,
      createdAt: new Date().toISOString(),
    });
    sent += 1;

    await recordAuditEvent({ actorUserId: user.id, action: "notification.create", entityType: "Notification", entityId: id });
  }

  if (sent > 0) revalidatePath("/admin/notifications");
  return { sent, alreadyNotified, noPortalAccount };
}
