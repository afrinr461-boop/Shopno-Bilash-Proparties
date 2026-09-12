import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContractorForm } from "@/components/admin/construction/ContractorForm";
import { createContractor } from "@/features/contractors/actions";

export default async function NewContractorPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "construction.manage")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to add a contractor." />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Add Contractor"
        breadcrumbs={[
          { label: "Construction", href: "/admin/construction" },
          { label: "Contractors", href: "/admin/construction/contractors" },
          { label: "New" },
        ]}
      />
      <div className="p-4 sm:p-6">
        <ContractorForm action={createContractor} submitLabel="Add Contractor" />
      </div>
    </>
  );
}
