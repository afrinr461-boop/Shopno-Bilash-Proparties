import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PaymentForm } from "@/components/admin/finance/PaymentForm";
import { createPayment } from "@/features/finance/paymentActions";
import { customerRepository } from "@/features/customers/repository";
import { projectRepository } from "@/features/projects/repository";

export default async function NewPaymentPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "finance.manage")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to record a payment." />
      </div>
    );
  }

  const [customers, projects] = await Promise.all([customerRepository.list(), projectRepository.list()]);

  return (
    <>
      <AdminPageHeader title="Record Payment" breadcrumbs={[{ label: "Payments", href: "/admin/sales/payments" }, { label: "New" }]} />
      <div className="p-4 sm:p-6">
        <PaymentForm action={createPayment} customers={customers} projects={projects} submitLabel="Record Payment" />
      </div>
    </>
  );
}
