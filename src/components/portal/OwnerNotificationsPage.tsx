import { getCurrentUser } from "@/lib/auth";
import { resolveOwnerContext } from "@/lib/ownerContext";
import { EmptyState } from "@/components/feedback/EmptyState";
import { getOwnerNotifications } from "@/features/ownerPortal/queries";
import { OwnerNotificationRow } from "@/components/portal/OwnerNotificationRow";

/** Notifications — the owner's own filtered inbox (`getOwnerNotifications` already excludes archived and anything not addressed to their linked account), tap-to-read only; filtering/archiving UI is deferred to a later Chapter 3 prompt. */
export async function OwnerNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const context = resolveOwnerContext(user);
  if (!context) {
    return (
      <div className="p-4 sm:p-6 lg:p-10">
        <EmptyState title="No property linked yet" description="Please contact Shopno Bilash Properties Ltd. to complete your account setup." />
      </div>
    );
  }

  const notifications = await getOwnerNotifications(context.ownerType, context.ownerId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-6 lg:p-10">
      <div>
        <p className="text-label text-fg-subtle uppercase">Notifications</p>
        <h1 className="text-display-m text-fg mt-2">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="You're all caught up" description="You have no notifications right now." />
      ) : (
        <ul className="border-border bg-surface-raised divide-border divide-y overflow-hidden rounded-2xl border shadow-sm">
          {notifications.map((n) => (
            <OwnerNotificationRow key={n.id} notification={n} />
          ))}
        </ul>
      )}
    </div>
  );
}
