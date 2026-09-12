import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { DashboardSection } from "@/components/admin/dashboard/DashboardSection";
import { KpiCard } from "@/components/admin/dashboard/KpiCard";
import { GenerateContributionsButton } from "@/components/admin/finance/GenerateContributionsButton";
import { AllocationPreviewTable } from "@/components/admin/finance/AllocationPreviewTable";
import { EditableAllocationPreviewTable } from "@/components/admin/finance/EditableAllocationPreviewTable";
import { GoalInstallmentPlanForm } from "@/components/admin/finance/GoalInstallmentPlanForm";
import { TierAllocationBuilder } from "@/components/admin/finance/TierAllocationBuilder";
import { GoalLifecycleActions } from "@/components/admin/finance/GoalLifecycleActions";
import { ContributionsList, type ContributionRow } from "@/components/admin/finance/ContributionsList";
import { formatBDT, formatDate } from "@/lib/format";
import {
  computeContributionState,
  computeInstallmentObligationState,
  deriveGoalCollectionStatus,
} from "@/lib/contributionStatus";
import { computeGoalCollectionStats } from "@/features/costAllocations/goalStats";
import { resolveAllocationMethod } from "@/features/costAllocations/allocationMethods";
import {
  costAllocationRepository,
  ownerContributionRepository,
  contributionPaymentRepository,
  unitAllocationRepository,
  goalInstallmentRepository,
  ownerInstallmentObligationRepository,
  contributionAdjustmentRepository,
  unitTierRepository,
} from "@/features/costAllocations/repository";
import { recordContributionPayment, previewContributions, type AllocationPreview } from "@/features/costAllocations/actions";
import { projectRepository } from "@/features/projects/repository";
import { unitRepository } from "@/features/units/repository";
import { parkingRepository } from "@/features/parking/repository";
import { landownerAllocationRepository } from "@/features/landowners/repository";
import { resolveDocumentOwner } from "@/features/documents/resolveOwner";
import { canAccessProject } from "@/lib/projectScope";
import type { GoalInstallment, UnitTier } from "@/types/finance/costAllocation";

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

export default async function CostAllocationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "finance.view")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to view this allocation." />
      </div>
    );
  }

  const allocation = await costAllocationRepository.findById(id);
  if (!allocation) notFound();
  if (!canAccessProject(user, allocation.projectId)) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="This allocation belongs to a project you don't have access to." />
      </div>
    );
  }

  let project,
    contributionRows: ContributionRow[],
    draftPreview: AllocationPreview | { error: string } | null = null,
    editableUnits: { id: string; unitNumber: string; ownerLabel: string; ownerHref?: string; sizeSqft: number }[] = [],
    editableParking: { id: string; parkingNumber: string; ownerLabel: string }[] = [],
    tiers: UnitTier[] = [],
    installments: GoalInstallment[] | undefined,
    goalStats;
  try {
    project = await projectRepository.findById(allocation.projectId);

    const [allContributions, allUnits, allAdjustments, allUnitAllocations, allInstallments, allObligations, allPayments] =
      await Promise.all([
        ownerContributionRepository.list(),
        unitRepository.list(),
        contributionAdjustmentRepository.list(),
        unitAllocationRepository.list(),
        goalInstallmentRepository.list(),
        ownerInstallmentObligationRepository.list(),
        contributionPaymentRepository.list(),
      ]);

    const contributions = allContributions.filter((c) => c.costAllocationId === id);
    const unitsById = new Map(allUnits.map((u) => [u.id, u]));
    installments = allInstallments.filter((i) => i.costAllocationId === id).sort((a, b) => a.installmentNumber - b.installmentNumber);
    const adjustments = allAdjustments.filter((a) => contributions.some((c) => c.id === a.contributionId));

    goalStats = computeGoalCollectionStats(allocation, contributions, adjustments);

    contributionRows = await Promise.all(
      contributions.map(async (contribution) => {
        const ownAdjustments = adjustments.filter((a) => a.contributionId === contribution.id);
        const state = computeContributionState(contribution, allocation, ownAdjustments);
        const resolved = await resolveDocumentOwner(contribution.ownerType, contribution.ownerId);
        const unitBreakdown = allUnitAllocations
          .filter((ua) => ua.contributionId === contribution.id)
          .map((ua) => ({ unitNumber: unitsById.get(ua.unitId)?.unitNumber ?? "—", payableAmount: ua.payableAmount.amount }));

        const ownObligations = allObligations.filter((o) => o.contributionId === contribution.id);
        const installmentOptions =
          ownObligations.length > 0
            ? ownObligations.map((obligation) => {
                const installment = installments!.find((i) => i.id === obligation.goalInstallmentId)!;
                const paid = allPayments
                  .filter((p) => p.installmentObligationId === obligation.id)
                  .reduce((s, p) => s + p.amount.amount, 0);
                const obligationState = computeInstallmentObligationState(obligation, installment, paid);
                return { id: obligation.id, label: installment.label, dueDate: installment.dueDate, outstanding: obligationState.outstanding };
              })
            : undefined;

        return {
          contributionId: contribution.id,
          ownerType: contribution.ownerType,
          ownerName: resolved.label,
          ownerHref: resolved.href,
          units: contribution.unitIds.map((uid) => unitsById.get(uid)?.unitNumber).filter((u): u is string => !!u),
          unitBreakdown,
          sizeSqft: contribution.unitSizeSqft,
          shareRatio: contribution.shareRatio,
          payableAmount: contribution.payableAmount.amount,
          paidAmount: contribution.paidAmount.amount,
          effectivePayable: state.effectivePayable,
          outstanding: state.outstanding,
          fineAmount: state.fineAmount,
          totalDue: state.totalDue,
          status: state.status,
          dueDate: contribution.dueDate,
          adjustments: ownAdjustments,
          installmentOptions,
        };
      }),
    );

    if (allocation.status === "draft") {
      const method = resolveAllocationMethod(allocation.allocationMethod);
      if (method === "fixed-unit" || method === "custom" || method === "tier") {
        const projectUnits = allUnits.filter((u) => u.projectId === allocation.projectId);
        const resolvedUnits = await Promise.all(
          projectUnits.map(async (unit) => {
            let ownerLabel = "Unowned (excluded)";
            let ownerHref: string | undefined;
            if (unit.customerId) {
              const resolved = await resolveDocumentOwner("customer", unit.customerId);
              ownerLabel = resolved.label;
              ownerHref = resolved.href;
            } else if (unit.shareholderId) {
              const resolved = await resolveDocumentOwner("shareholder", unit.shareholderId);
              ownerLabel = resolved.label;
              ownerHref = resolved.href;
            } else if (unit.landownerAllocationId) {
              const landownerAllocation = await landownerAllocationRepository.findById(unit.landownerAllocationId);
              if (landownerAllocation) {
                const resolved = await resolveDocumentOwner("landowner", landownerAllocation.landownerId);
                ownerLabel = resolved.label;
                ownerHref = resolved.href;
              }
            }
            return { id: unit.id, unitNumber: unit.unitNumber, ownerLabel, ownerHref, sizeSqft: unit.sizeSqft, owned: ownerLabel !== "Unowned (excluded)" };
          }),
        );
        editableUnits = resolvedUnits.filter((u) => u.owned);

        if (allocation.includeParkingInAllocation) {
          const projectParking = (await parkingRepository.list()).filter((p) => p.projectId === allocation.projectId && p.ownerType && p.ownerId);
          editableParking = await Promise.all(
            projectParking.map(async (p) => ({
              id: p.id,
              parkingNumber: p.parkingNumber,
              ownerLabel: (await resolveDocumentOwner(p.ownerType!, p.ownerId!)).label,
            })),
          );
        }

        if (method === "tier") {
          tiers = (await unitTierRepository.list()).filter((t) => t.costAllocationId === id);
          draftPreview = await previewContributions(id);
        }
      } else {
        draftPreview = await previewContributions(id);
      }
    }
  } catch {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState description="This allocation couldn't be loaded. Please try again." />
      </div>
    );
  }

  const canManage = hasPermission(user.role, "finance.manage");
  const boundPaymentAction = recordContributionPayment.bind(null, allocation.id);
  const goalStatus = deriveGoalCollectionStatus(allocation, goalStats.collectionPercent);
  const method = resolveAllocationMethod(allocation.allocationMethod);

  return (
    <>
      <AdminPageHeader
        title={allocation.title}
        breadcrumbs={[{ label: "Cost Allocations", href: "/admin/finance/cost-allocations" }, { label: allocation.title }]}
        secondaryActions={
          <div className="flex items-center gap-2">
            <StatusBadge status={goalStatus} />
            {canManage && allocation.status === "generated" && (
              <GoalLifecycleActions
                costAllocationId={allocation.id}
                showMarkCompleted={goalStatus === "fully-funded"}
                isArchived={!!allocation.archivedAt}
              />
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-2">
        <section className="border-border bg-surface-raised flex flex-col gap-4 rounded-lg border p-4">
          <h2 className="text-label text-fg-subtle uppercase">Allocation</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-caption text-fg-subtle uppercase">Project</p>
              {project ? (
                <Link href={`/admin/projects/${project.id}`} className="text-body-sm text-accent hover:text-accent-strong mt-0.5 block transition-colors">
                  {project.name}
                </Link>
              ) : (
                <p className="text-body-sm text-fg mt-0.5">—</p>
              )}
            </div>
            <Fact label="Category" value={allocation.category} />
            <Fact label="Total Amount" value={formatBDT(allocation.totalAmount.amount)} />
            <Fact label="Allocation Date" value={formatDate(new Date(allocation.allocationDate))} />
            <Fact label="Due Date" value={formatDate(new Date(allocation.dueDate))} />
            <Fact
              label="Fine Rule"
              value={allocation.fineType === "flat" ? `${formatBDT(allocation.fineValue)} flat` : `${allocation.fineValue}% of outstanding`}
            />
            <Fact
              label="Allocation Method"
              value={
                method === "sqft"
                  ? "Area / Square Feet"
                  : method === "unit-ratio"
                    ? "Predefined Unit Ratio"
                    : method === "fixed-unit"
                      ? "Fixed Amount per Unit"
                      : method === "tier"
                        ? "Tiered Groups (Custom)"
                        : "Fully Custom per Unit"
              }
            />
            {allocation.linkedExpenseId && <Fact label="Linked Expense" value="View →" />}
          </div>
        </section>

        {allocation.status === "draft" && canManage && method !== "tier" && (
          <section className="border-border bg-surface-raised flex flex-col gap-4 rounded-lg border p-4">
            <h2 className="text-label text-fg-subtle uppercase">Generate Contributions</h2>
            {method === "fixed-unit" || method === "custom" ? (
              editableUnits.length === 0 ? (
                <p className="text-body-sm text-fg-subtle">No owned units found in this project — nothing to allocate.</p>
              ) : (
                <EditableAllocationPreviewTable
                  costAllocationId={allocation.id}
                  totalAmount={allocation.totalAmount.amount}
                  units={editableUnits}
                  parkingSpaces={editableParking}
                />
              )
            ) : draftPreview && "error" in draftPreview ? (
              <p className="text-body-sm text-error">{draftPreview.error}</p>
            ) : draftPreview ? (
              <>
                <AllocationPreviewTable preview={draftPreview} totalAmount={allocation.totalAmount.amount} />
                <div>
                  <GenerateContributionsButton costAllocationId={allocation.id} />
                </div>
              </>
            ) : null}
          </section>
        )}
      </div>

      {allocation.status === "draft" && canManage && method === "tier" && (
        <div className="p-4 sm:p-6 pt-0">
          <section className="border-border bg-surface-raised flex flex-col gap-4 rounded-lg border p-4">
            <h2 className="text-label text-fg-subtle uppercase">Generate Contributions — Tiered Groups</h2>
            {editableUnits.length === 0 ? (
              <p className="text-body-sm text-fg-subtle">No owned units found in this project — nothing to allocate.</p>
            ) : (
              <TierAllocationBuilder
                costAllocationId={allocation.id}
                totalAmount={allocation.totalAmount.amount}
                units={editableUnits}
                tiers={tiers}
                preview={draftPreview}
                parkingSpaces={editableParking}
              />
            )}
          </section>
        </div>
      )}

      {allocation.status === "generated" && (
        <>
          <div className="p-4 sm:p-6 pt-0">
            <DashboardSection title="Collection Dashboard">
              <KpiCard label="Target" value={goalStats.target} formatValue={formatBDT} />
              <KpiCard label="Allocated" value={goalStats.allocated} formatValue={formatBDT} />
              <KpiCard label="Collected" value={goalStats.collected} formatValue={formatBDT} />
              <KpiCard
                label="Outstanding"
                value={goalStats.outstanding}
                formatValue={formatBDT}
                status={goalStats.outstanding > 0 ? "warning" : "success"}
              />
              <KpiCard label="Collection %" value={goalStats.collectionPercent} formatValue={(v) => `${v}%`} />
              <KpiCard label="Fully Paid Owners" value={goalStats.ownerCounts.fullyPaid} />
              <KpiCard label="Partial" value={goalStats.ownerCounts.partial} status={goalStats.ownerCounts.partial > 0 ? "warning" : "success"} />
              <KpiCard label="Unpaid" value={goalStats.ownerCounts.unpaid} status={goalStats.ownerCounts.unpaid > 0 ? "error" : "success"} />
            </DashboardSection>
          </div>

          <div className="p-4 sm:p-6 pt-0">
            <h2 className="text-label text-fg-subtle mb-3 uppercase">Installment Plan</h2>
            {installments && installments.length === 0 ? (
              canManage ? (
                <GoalInstallmentPlanForm costAllocationId={allocation.id} />
              ) : (
                <EmptyState title="No installment plan yet" description="This goal is payable as one lump sum until a plan is created." />
              )
            ) : (
              <div className="flex flex-col gap-2">
                {installments?.map((installment) => (
                  <div key={installment.id} className="border-border bg-surface-raised flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-body-sm text-fg font-medium">{installment.label}</p>
                      <p className="text-caption text-fg-subtle">Due {formatDate(new Date(installment.dueDate))}</p>
                    </div>
                    <p className="text-body-sm text-fg-muted">
                      {installment.amountMode === "percentage" ? `${installment.amountValue}%` : formatBDT(installment.amountValue)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 pt-0">
            <h2 className="text-label text-fg-subtle mb-3 uppercase">Owner Contributions</h2>
            <ContributionsList
              costAllocationId={allocation.id}
              rows={contributionRows}
              canManage={canManage}
              boundPaymentAction={boundPaymentAction}
            />
          </div>
        </>
      )}
    </>
  );
}
