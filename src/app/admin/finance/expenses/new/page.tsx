import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExpenseForm } from "@/components/admin/finance/ExpenseForm";
import { createExpense } from "@/features/finance/expenseActions";
import { projectRepository } from "@/features/projects/repository";
import { vendorRepository } from "@/features/procurement/repository";
import { constructionPhaseRepository } from "@/features/construction/repository";
import { buildingRepository } from "@/features/buildings/repository";
import { contractorRepository } from "@/features/contractors/repository";
import { cashAccountRepository } from "@/features/finance/repository";

export default async function NewExpensePage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "finance.manage")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to record an expense." />
      </div>
    );
  }

  const [projects, vendors, phases, buildings, contractors, accounts] = await Promise.all([
    projectRepository.list(),
    vendorRepository.list(),
    constructionPhaseRepository.list(),
    buildingRepository.list(),
    contractorRepository.list(),
    cashAccountRepository.list(),
  ]);

  return (
    <>
      <AdminPageHeader title="Record Expense" breadcrumbs={[{ label: "Expenses", href: "/admin/finance/expenses" }, { label: "New" }]} />
      <div className="p-4 sm:p-6">
        <ExpenseForm
          action={createExpense}
          projects={projects}
          vendors={vendors}
          phases={phases}
          buildings={buildings}
          contractors={contractors}
          accounts={accounts}
          submitLabel="Record Expense"
        />
      </div>
    </>
  );
}
