import type { AuditFields, ID, Money } from "./common";
import type { TransactionPaymentMethod, TransactionStatus } from "./finance/base";

export type LifecycleStatus = "active" | "inactive";

/**
 * A real contractor entity — mirrors `Vendor` (`src/types/procurement.ts`)
 * closely on purpose, since a contractor is the labor-side equivalent of a
 * material supplier. Kept separate from `Vendor` because a contractor
 * (piling crew, electrician) usually isn't a material supplier and doesn't
 * need `categories`/purchase-history fields that only make sense for goods.
 */
export interface Contractor extends AuditFields {
  id: ID;
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  /** Free text, e.g. "Piling", "Electrical", "Tiles" — not a fixed enum, contractors' trades vary by project. */
  specialty?: string;
  notes?: string;
  status?: LifecycleStatus;
}

/**
 * Append-only assignment history — closing one span (`unassignedDate` set)
 * and opening a new one is how a contractor change is recorded, mirroring
 * the "open/close a span" pattern already proven for unit/parking
 * ownership (`src/features/ownership/writeThrough.ts`) rather than ever
 * overwriting `ConstructionPhase.contractorId`/`ConstructionTask.contractorId`
 * with no trace of who held it before.
 */
export interface ContractorAssignment extends AuditFields {
  id: ID;
  projectId: ID;
  phaseId?: ID;
  taskId?: ID;
  contractorId: ID;
  assignedDate: string;
  /** Absent = this is the current assignment for this phase/task. */
  unassignedDate?: string;
  notes?: string;
}

/**
 * A real payment made to a contractor — mirrors `ContributionPayment`'s
 * exact shape (`src/types/finance/costAllocation.ts`). One of the three
 * real transaction sources `computePhaseActualCost` sums (alongside
 * phase-tagged `Purchase`/`ProjectExpense`) — not a new accounting ledger,
 * just a flat, traceable payment record.
 */
export interface ContractorPayment extends AuditFields {
  id: ID;
  projectId: ID;
  contractorId: ID;
  phaseId?: ID;
  taskId?: ID;
  amount: Money;
  date: string;
  reference?: string;
  notes?: string;
  paymentMethod?: TransactionPaymentMethod;
  accountId?: ID;
  status?: TransactionStatus;
  attachmentIds?: ID[];
}
