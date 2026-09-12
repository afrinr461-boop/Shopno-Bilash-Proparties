import { getCurrentUser } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NotificationPreferencesForm } from "@/components/admin/settings/NotificationPreferencesForm";
import { notificationPreferenceRepository } from "@/features/notifications/repository";

/** Prompt 9 §13 — a signed-in user's own notification preferences. */
export default async function NotificationPreferencesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const all = await notificationPreferenceRepository.list();
  const preference = all.find((p) => p.userId === user.id);

  return (
    <>
      <AdminPageHeader
        title="Notification Preferences"
        breadcrumbs={[{ label: "Settings", href: "/admin/settings" }, { label: "Notifications" }]}
        description="Control which alerts and reminders reach you, and how."
      />
      <div className="p-4 sm:p-6">
        <NotificationPreferencesForm preference={preference} />
      </div>
    </>
  );
}
