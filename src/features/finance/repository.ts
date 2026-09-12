import { createPrismaRepository } from "@/lib/prismaRepository";
import type { Repository } from "@/lib/repository";
import type { CustomerPayment } from "@/types/finance/customer";
import type { ProjectBudget, ProjectExpense, FinancialAdjustment } from "@/types/finance/project";
import type { CashAccount } from "@/types/finance/account";

/**
 * Reference implementation of the `src/lib/repository.ts` pattern for
 * customer payments (`types/finance/customer.ts`'s `CustomerPayment`) —
 * one of four deliberately separate finance domains (project/customer/
 * shareholder/company, ARCHITECTURE.md §6). Admin Step 10 is scoped to
 * this one domain; `CustomerInvoice` (same file) and the project/
 * shareholder/company finance types are not introduced here.
 *
 * Backed by the real database (`prisma/schema.prisma`) — see
 * `src/lib/prismaRepository.ts`.
 */
export const customerPaymentRepository: Repository<CustomerPayment> =
  createPrismaRepository<CustomerPayment>("customerPayment");

/**
 * Admin Step 13 — the Project finance domain's `ProjectExpense` (a cost
 * tied to a specific project). `CompanyExpense` (`types/finance/company.ts`)
 * is just a type alias for `FinancialRecordBase` with no distinguishing
 * fields of its own and no project link — left for a later step, same
 * "one entity, one step" discipline as every domain before it.
 */
export const projectExpenseRepository: Repository<ProjectExpense> =
  createPrismaRepository<ProjectExpense>("projectExpense");

/**
 * Admin Step 14 — the Project finance domain's `ProjectBudget` (budgeted
 * vs. actual cost tracking for one project). A separate record from
 * `ProjectExpense` above — a budget line is a plan/ceiling, an expense is
 * money actually spent; ARCHITECTURE.md §6 keeps them distinct rather
 * than deriving one from the other.
 */
export const projectBudgetRepository: Repository<ProjectBudget> =
  createPrismaRepository<ProjectBudget>("projectBudget");

/** Prompt 6 — internal Cash/Bank/Mobile-banking records Expenses and Contractor Payments can be tagged against. */
export const cashAccountRepository: Repository<CashAccount> =
  createPrismaRepository<CashAccount>("cashAccount");

/** Prompt 6 — non-destructive corrections against a real ProjectExpense or ContractorPayment, see `types/finance/project.ts`'s `FinancialAdjustment` doc comment. */
export const financialAdjustmentRepository: Repository<FinancialAdjustment> =
  createPrismaRepository<FinancialAdjustment>("financialAdjustment");
