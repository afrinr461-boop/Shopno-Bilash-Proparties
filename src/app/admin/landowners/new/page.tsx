import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LandownerForm } from "@/components/admin/landowners/LandownerForm";
import { createLandowner } from "@/features/landowners/landownerActions";

export default async function NewLandownerPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "landowner.manage")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to add a landowner." />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader title="New Landowner" breadcrumbs={[{ label: "Landowners", href: "/admin/landowners" }, { label: "New" }]} />
      <div className="p-4 sm:p-6">
        <LandownerForm action={createLandowner} submitLabel="Add Landowner" />
      </div>
    </>
  );
}
