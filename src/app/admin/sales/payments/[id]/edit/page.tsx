import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PaymentForm } from "@/components/admin/finance/PaymentForm";
import { updatePayment } from "@/features/finance/paymentActions";
import { customerPaymentRepository } from "@/features/finance/repository";
import { customerRepository } from "@/features/customers/repository";
import { projectRepository } from "@/features/projects/repository";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPaymentPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "finance.manage")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to edit this payment." />
      </div>
    );
  }

  const [payment, customers, projects] = await Promise.all([
    customerPaymentRepository.findById(id),
    customerRepository.list(),
    projectRepository.list(),
  ]);
  if (!payment) notFound();

  const boundAction = updatePayment.bind(null, id);

  return (
    <>
      <AdminPageHeader
        title="Edit Payment"
        breadcrumbs={[
          { label: "Payments", href: "/admin/sales/payments" },
          { label: payment.id, href: `/admin/sales/payments/${id}` },
          { label: "Edit" },
        ]}
      />
      <div className="p-4 sm:p-6">
        <PaymentForm action={boundAction} payment={payment} customers={customers} projects={projects} submitLabel="Save Changes" />
      </div>
    </>
  );
}
