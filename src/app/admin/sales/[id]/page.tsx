import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { DeleteSaleButton } from "@/components/admin/sales/DeleteSaleButton";
import { formatBDT, formatDate } from "@/lib/format";
import { saleRepository, bookingRepository } from "@/features/sales/repository";
import { unitRepository } from "@/features/units/repository";
import { customerRepository } from "@/features/customers/repository";
import { projectRepository } from "@/features/projects/repository";
import { userRepository } from "@/features/users/repository";
import { canAccessProject } from "@/lib/projectScope";

interface PageProps {
  params: Promise<{ id: string }>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-fg-subtle uppercase">{label}</p>
      <p className="text-body-sm text-fg mt-0.5">{value}</p>
    </div>
  );
}

/**
 * Read-only overview (Admin Step 9, matching the Step 5-8 pattern) —
 * create/edit come in a later step. This is the stable relationship key
 * future modules (Payments, Installments) will reference by `saleId`;
 * `Booking`/`Contract` (also in `types/sales.ts`) are siblings sharing the
 * same unit/customer keys, not shown here — out of scope this step.
 */
export default async function AdminSaleDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "sales.view")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to view this sale." />
      </div>
    );
  }

  let sale, unit, customer, project, salesperson, booking;
  try {
    sale = await saleRepository.findById(id);
    unit = sale ? await unitRepository.findById(sale.unitId) : null;
    customer = sale ? await customerRepository.findById(sale.customerId) : null;
    project = unit ? await projectRepository.findById(unit.projectId) : null;
    salesperson = sale?.salespersonId ? await userRepository.findById(sale.salespersonId) : null;
    booking = sale?.bookingId ? await bookingRepository.findById(sale.bookingId) : null;
  } catch {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState description="This sale couldn't be loaded. Please try again." />
      </div>
    );
  }

  if (!sale) notFound();
  if (unit && !canAccessProject(user, unit.projectId)) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="This sale belongs to a project you don't have access to." />
      </div>
    );
  }

  const canUpdate = hasPermission(user.role, "sales.update");
  const canDelete = hasPermission(user.role, "sales.delete");

  return (
    <>
      <AdminPageHeader
        title={unit ? `Sale — ${unit.unitNumber}` : "Sale"}
        breadcrumbs={[{ label: "Sales", href: "/admin/sales" }, { label: unit ? unit.unitNumber : sale.id }]}
        secondaryActions={
          <div className="flex items-center gap-2">
            {canUpdate && (
              <Link href={`/admin/sales/${sale.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Pencil aria-hidden className="size-3.5" />
                Edit
              </Link>
            )}
            {canDelete && <DeleteSaleButton id={sale.id} />}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-2">
        <section className="border-border bg-surface-raised flex flex-col gap-4 rounded-lg border p-4">
          <h2 className="text-label text-fg-subtle uppercase">Unit</h2>
          {unit ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Fact label="Unit" value={unit.unitNumber} />
                <Fact label="Project" value={project ? project.name : "—"} />
              </div>
              <Link
                href={`/admin/properties/${unit.id}`}
                className="text-body-sm text-accent hover:text-accent-strong transition-colors"
              >
                View unit →
              </Link>
            </>
          ) : (
            <p className="text-body-sm text-fg-subtle">This unit no longer exists.</p>
          )}
        </section>

        <section className="border-border bg-surface-raised flex flex-col gap-4 rounded-lg border p-4">
          <h2 className="text-label text-fg-subtle uppercase">Customer</h2>
          {customer ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Fact label="Name" value={customer.name} />
                <Fact label="Phone" value={customer.phone} />
              </div>
              <Link
                href={`/admin/customers/${customer.id}`}
                className="text-body-sm text-accent hover:text-accent-strong transition-colors"
              >
                View customer →
              </Link>
            </>
          ) : (
            <p className="text-body-sm text-fg-subtle">This customer no longer exists.</p>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-label text-fg-subtle uppercase">Sale</h2>
            <StatusBadge status={sale.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Fact label="Sale Date" value={formatDate(new Date(sale.saleDate))} />
            <Fact label="Base Price" value={formatBDT(sale.basePrice.amount)} />
            <Fact label="Final Sale Price" value={formatBDT(sale.salePrice.amount)} />
            {sale.floorPremium && <Fact label="Floor Premium" value={formatBDT(sale.floorPremium.amount)} />}
            {sale.parkingPrice && <Fact label="Parking Price" value={formatBDT(sale.parkingPrice.amount)} />}
            {sale.additionalCharges && <Fact label="Additional Charges" value={formatBDT(sale.additionalCharges.amount)} />}
            {sale.discountAmount && (
              <Fact
                label="Discount"
                value={`${formatBDT(sale.discountAmount.amount)}${sale.discountType ? ` (${sale.discountType})` : ""}${sale.discountReason ? ` — ${sale.discountReason}` : ""}`}
              />
            )}
            <Fact label="Payment Terms" value={sale.paymentTerms ?? "—"} />
            <Fact label="Salesperson" value={salesperson?.name ?? "—"} />
            {booking && <Fact label="Converted From" value={`Booking ${booking.reference ?? booking.id.slice(0, 8)}`} />}
          </div>
        </section>

        <section>
          <h2 className="text-label text-fg-subtle mb-2 uppercase">Record</h2>
          <div className="grid grid-cols-2 gap-4">
            <Fact label="Created" value={formatDate(new Date(sale.createdAt))} />
            <Fact label="Last Updated" value={formatDate(new Date(sale.updatedAt))} />
          </div>
        </section>
      </div>
    </>
  );
}
