import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { buttonVariants } from "@/components/ui/Button";
import { CustomersAdminExplorer } from "@/components/admin/customers/CustomersAdminExplorer";
import { customerRepository } from "@/features/customers/repository";

/**
 * Admin Step 7 — Customer Management Foundation. Reads `customerRepository`
 * (the internal `types/customer.ts` shape) — a Customer is a business
 * record, never the same thing as a portal login
 * (`features/users/repository.ts`). Full create/edit/delete.
 */
export default async function AdminCustomersPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "customer.view")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to view Customers." />
      </div>
    );
  }

  let customers;
  try {
    customers = await customerRepository.list();
  } catch {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState description="Customers couldn't be loaded. Please try again." />
      </div>
    );
  }

  const canCreate = hasPermission(user.role, "customer.create");
  const canDelete = hasPermission(user.role, "customer.delete");

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Everyone who has enquired, reserved, or purchased with us."
        primaryAction={
          canCreate && (
            <Link href="/admin/customers/new" className={buttonVariants({ size: "md" })}>
              <Plus aria-hidden className="size-4" />
              New Customer
            </Link>
          )
        }
      />
      <div className="p-4 sm:p-6">
        <CustomersAdminExplorer customers={customers} canCreate={canCreate} canDelete={canDelete} />
      </div>
    </>
  );
}
