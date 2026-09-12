import type { AuditFields, ID, Money } from "./common";

/** "planned"/"cancelled" are additive (Chapter 2 Prompt 5) — every row created before they existed keeps working under the original five values. */
export type ConstructionStatus = "not-started" | "planned" | "in-progress" | "completed" | "delayed" | "on-hold" | "cancelled";

export type ConstructionPriority = "low" | "medium" | "high" | "critical";

/**
 * How a phase's `progressPercentage` should be interpreted. "manual" (the
 * only mode that ever existed before Prompt 5) means the stored number is
 * the whole truth, hand-typed by the Admin. The other three are *derived*
 * at read time from real data (`derivePhaseProgress`, `src/lib/
 * constructionProgress.ts`) — the stored `progressPercentage` is left
 * alone either way, never overwritten by the derivation.
 */
export type ProgressTrackingMethod = "manual" | "quantity" | "task" | "milestone";

/**
 * Phase names (Land, Design, Approval, Piling, ... Handover) are configurable
 * seed data per project, not a hardcoded enum — admins can reorder or add
 * phases, so `name`/`order` live on the record itself.
 */
export interface ConstructionPhase extends AuditFields {
  id: ID;
  projectId: ID;
  name: string;
  description?: string;
  order: number;
  startDate?: string;
  /** Target completion — when the phase was planned to finish. Kept live/current by `reviseSchedule`; the ORIGINAL value survives in `ScheduleRevision`, never lost. */
  endDate?: string;
  /** When the phase genuinely started — absent on rows created before this field existed. */
  actualStartDate?: string;
  /** When the phase genuinely finished — set once, separate from the target above so a delay stays visible instead of the target date being silently overwritten. */
  actualEndDate?: string;
  /** Free text, not a Vendor link — most contractors doing labor-only work here aren't material vendors and don't need a full Vendor record. Superseded by `contractorId` going forward; kept for old rows and as a fallback when no formal Contractor record exists. */
  contractorName?: string;
  /** The current contractor — a fast pointer; `ContractorAssignment` (`src/types/contractor.ts`) is the append-only history of every contractor this phase has ever had. */
  contractorId?: ID;
  priority?: ConstructionPriority;
  estimatedCost?: Money;
  /**
   * Opt-in weighted-overall-progress input (§10) — `computeOverallProgress`
   * only switches to weighted math when EVERY phase in a project has a
   * weight set; otherwise the original flat average applies untouched.
   */
  weight?: number;
  /** Absent = "manual" (the original, only behavior). */
  trackingMethod?: ProgressTrackingMethod;
  /** Only meaningful when trackingMethod is "quantity", e.g. "100 piles planned". */
  quantityPlanned?: number;
  quantityCompleted?: number;
  /** Optional scope — absent means project-wide. Never forced: most phases apply to the whole project. */
  buildingId?: ID;
  floorId?: ID;
  unitId?: ID;
  progressPercentage: number;
  status: ConstructionStatus;
}

export interface ConstructionTask extends AuditFields {
  id: ID;
  phaseId: ID;
  /** Denormalized from the phase's project, matching every other domain's project-scoping convention. */
  projectId: ID;
  title: string;
  description?: string;
  responsibleUserId?: ID;
  buildingId?: ID;
  floorId?: ID;
  startDate?: string;
  /** Due date — kept live/current by `reviseSchedule`, same convention as `ConstructionPhase.endDate`. */
  endDate?: string;
  /** When the task genuinely finished — distinct from `endDate`'s "due date" role. */
  completionDate?: string;
  progressPercentage?: number;
  priority?: ConstructionPriority;
  contractorId?: ID;
  estimatedCost?: Money;
  /**
   * Shown as a warning when an unfinished dependency exists, never used to
   * block completing this task — a practical, not enforced, dependency
   * system per the brief's own "don't over-engineer" instruction.
   */
  dependsOnTaskIds?: ID[];
  status: ConstructionStatus;
  notes?: string;
  photoUrls: string[];
  documentIds: ID[];
}

/** An important, dated construction event — visible on the project timeline/dashboard, independent of any one phase reaching 100%. */
export interface Milestone extends AuditFields {
  id: ID;
  projectId: ID;
  name: string;
  relatedPhaseId?: ID;
  targetDate?: string;
  completedDate?: string;
  status: "upcoming" | "completed";
  notes?: string;
}

/**
 * A permanent record of a target-date change — `ConstructionPhase.endDate`/
 * `ConstructionTask.endDate` always hold the CURRENT target; this table is
 * the append-only "original → revised → reason → who → when" trail the
 * brief asks for, written only by `reviseSchedule` (never by the plain
 * edit forms, so routine data entry doesn't spam the history).
 */
export interface ScheduleRevision extends AuditFields {
  id: ID;
  targetType: "phase" | "task";
  targetId: ID;
  projectId: ID;
  previousTargetDate: string;
  newTargetDate: string;
  reason: string;
}

/** A chronological journal entry — "what happened on site," never mutates any stage's stored progress on its own (that stays an explicit, separate Admin decision on the Phase/Task itself). */
export interface ConstructionActivityLog extends AuditFields {
  id: ID;
  projectId: ID;
  phaseId?: ID;
  taskId?: ID;
  date: string;
  activity: string;
  contractorId?: ID;
  notes?: string;
}
