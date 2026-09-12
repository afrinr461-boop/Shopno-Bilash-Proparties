import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Construction,
  CalendarClock,
  PauseCircle,
  Circle,
  PieChart,
  UserCheck,
  Archive,
  type LucideIcon,
} from "lucide-react";

export type StatusTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

export interface StatusConfig {
  label: string;
  tone: StatusTone;
  icon: LucideIcon;
}

/**
 * Every status badge in the platform must resolve to one of these entries —
 * never encode meaning through color alone. Add new statuses here rather
 * than inlining a color/label pair at the call site.
 */
export const STATUS_CONFIG = {
  // Generic / financial
  paid: { label: "Paid", tone: "success", icon: CheckCircle2 },
  approved: { label: "Approved", tone: "success", icon: CheckCircle2 },
  completed: { label: "Completed", tone: "success", icon: CheckCircle2 },
  pending: { label: "Pending", tone: "warning", icon: Clock },
  "due-soon": { label: "Due Soon", tone: "warning", icon: AlertTriangle },
  "under-review": { label: "Under Review", tone: "warning", icon: Clock },
  overdue: { label: "Overdue", tone: "error", icon: AlertTriangle },
  cancelled: { label: "Cancelled", tone: "error", icon: XCircle },
  rejected: { label: "Rejected", tone: "error", icon: XCircle },
  ongoing: { label: "Ongoing", tone: "info", icon: Construction },
  "in-progress": { label: "In Progress", tone: "info", icon: RefreshCw },
  scheduled: { label: "Scheduled", tone: "info", icon: CalendarClock },

  // Project status (section 13)
  upcoming: { label: "Upcoming", tone: "neutral", icon: CalendarClock },
  ready: { label: "Ready", tone: "success", icon: CheckCircle2 },

  // Property availability (section 14)
  available: { label: "Available", tone: "success", icon: CheckCircle2 },
  reserved: { label: "Reserved", tone: "warning", icon: Clock },
  sold: { label: "Sold", tone: "neutral", icon: XCircle },
  unavailable: { label: "Unavailable", tone: "error", icon: XCircle },

  // Admin Step 2 additions — Project/Construction/Payment lifecycle states
  // (types/project.ts's ProjectStatus, types/construction.ts's
  // ConstructionStatus, and payment status don't reuse the keys above 1:1,
  // so these fill the gaps rather than overloading an existing label).
  planning: { label: "Planning", tone: "neutral", icon: PieChart },
  active: { label: "Active", tone: "info", icon: RefreshCw },
  paused: { label: "Paused", tone: "warning", icon: PauseCircle },
  "not-started": { label: "Not Started", tone: "neutral", icon: Circle },
  delayed: { label: "Delayed", tone: "error", icon: AlertTriangle },
  partial: { label: "Partial", tone: "warning", icon: PieChart },
  due: { label: "Due", tone: "warning", icon: Clock },

  // Admin Step 5 — the one types/project.ts ProjectStatus value not
  // already covered above (upcoming/planning/ongoing/ready/completed/
  // cancelled all already existed).
  suspended: { label: "Suspended", tone: "warning", icon: PauseCircle },

  // Admin Step 6 — the types/unit.ts UnitStatus values not already covered
  // above (available/reserved/sold/cancelled all already existed).
  booked: { label: "Booked", tone: "info", icon: CalendarClock },
  allocated: { label: "Allocated", tone: "info", icon: UserCheck },
  "on-hold": { label: "On Hold", tone: "warning", icon: PauseCircle },

  // Prompt 8 — the two remaining types/unit.ts UnitStatus values (unavailable/
  // under-construction were already covered above, via Parking/Project status).
  "under-agreement": { label: "Under Agreement", tone: "info", icon: Clock },
  transferred: { label: "Transferred", tone: "neutral", icon: UserCheck },

  // Prompt 8 — Booking/Sale/OwnershipTransfer statuses not already covered
  // above (pending/completed/cancelled/rejected all already existed).
  confirmed: { label: "Confirmed", tone: "success", icon: CheckCircle2 },
  expired: { label: "Expired", tone: "error", icon: XCircle },
  converted: { label: "Converted", tone: "success", icon: CheckCircle2 },

  // Prompt 8 — types/crm.ts LeadPriority.
  low: { label: "Low", tone: "neutral", icon: Circle },
  medium: { label: "Medium", tone: "info", icon: Circle },
  high: { label: "High", tone: "warning", icon: AlertTriangle },
  urgent: { label: "Urgent", tone: "error", icon: AlertTriangle },

  // Prompt 9 — types/reminder.ts ReminderStatus/ReminderPriority ("low"/"medium"/"high"/"pending"/"completed"
  // all already existed above; "critical" reuses the same word Notification/Alert priority also uses).
  critical: { label: "Critical", tone: "error", icon: AlertTriangle },
  dismissed: { label: "Dismissed", tone: "neutral", icon: XCircle },
  unread: { label: "Unread", tone: "info", icon: Circle },
  read: { label: "Read", tone: "neutral", icon: CheckCircle2 },

  // Admin Step 7 — the types/customer.ts CustomerStatus values not already
  // covered above ("active" already existed).
  inactive: { label: "Inactive", tone: "neutral", icon: Circle },
  archived: { label: "Archived", tone: "neutral", icon: Archive },

  // Admin Step 11 — types/crm.ts's LeadStatus, a full pipeline with no
  // overlap with any status above.
  new: { label: "New", tone: "info", icon: Circle },
  contacted: { label: "Contacted", tone: "info", icon: RefreshCw },
  qualified: { label: "Qualified", tone: "info", icon: UserCheck },
  interested: { label: "Interested", tone: "info", icon: Clock },
  "site-visit": { label: "Site Visit", tone: "info", icon: CalendarClock },
  negotiation: { label: "Negotiation", tone: "warning", icon: PieChart },
  booking: { label: "Booking", tone: "success", icon: CheckCircle2 },
  won: { label: "Won", tone: "success", icon: CheckCircle2 },
  lost: { label: "Lost", tone: "error", icon: XCircle },

  // Admin Step 12 — the one types/document.ts DocumentStatus value not
  // already covered above ("active"/"archived" already existed).
  draft: { label: "Draft", tone: "neutral", icon: Circle },

  // Admin Step 15 — the types/user.ts UserStatus values not already
  // covered above ("active"/"suspended" already existed).
  invited: { label: "Invited", tone: "info", icon: Clock },
  disabled: { label: "Disabled", tone: "error", icon: XCircle },

  // Procurement — types/procurement.ts's PaymentStatus/DeliveryStatus
  // values not already covered above ("paid"/"pending"/"partial" already
  // existed).
  unpaid: { label: "Unpaid", tone: "error", icon: XCircle },
  "partially-paid": { label: "Partially Paid", tone: "warning", icon: PieChart },
  delivered: { label: "Delivered", tone: "success", icon: CheckCircle2 },

  // Landowner — types/landowner.ts's AgreementStatus values not already
  // covered above ("under-review"/"active"/"completed" already existed).
  proposed: { label: "Proposed", tone: "neutral", icon: Circle },
  signed: { label: "Signed", tone: "success", icon: UserCheck },
  terminated: { label: "Terminated", tone: "error", icon: XCircle },

  // Cost Allocation — types/finance/costAllocation.ts's CostAllocationStatus
  // ("draft"/"cancelled" already existed).
  generated: { label: "Generated", tone: "success", icon: CheckCircle2 },

  // Building/Floor/Unit/Parking (Chapter 2 Prompt 2) — the one
  // types/project.ts BuildingStatus value not already covered above
  // ("planning"/"completed" already existed), and the one
  // types/parking.ts ParkingStatus value not already covered
  // ("available"/"reserved"/"unavailable" already existed).
  "under-construction": { label: "Under Construction", tone: "info", icon: Construction },
  assigned: { label: "Assigned", tone: "info", icon: UserCheck },

  // Construction Goals (Chapter 2 Prompt 3) — the derived GoalCollectionStatus
  // values not already covered above ("draft"/"upcoming"/"active"/
  // "completed"/"cancelled"/"archived" all already existed).
  "fully-funded": { label: "Fully Funded", tone: "success", icon: CheckCircle2 },
  "partially-funded": { label: "Partially Funded", tone: "warning", icon: PieChart },

  // Materials/Procurement (Chapter 2 Prompt 4) — derived PurchaseReceivingStatus
  // values not already covered above ("cancelled"/"delivered" already existed,
  // "delivered" stays reserved for the old DeliveryStatus type).
  ordered: { label: "Ordered", tone: "neutral", icon: Circle },
  "partially-received": { label: "Partially Received", tone: "warning", icon: PieChart },
  "fully-received": { label: "Fully Received", tone: "success", icon: CheckCircle2 },

  // Construction (Chapter 2 Prompt 5) — the one new ConstructionStatus
  // value not already covered above ("not-started"/"in-progress"/
  // "completed"/"delayed"/"on-hold"/"cancelled" all already existed).
  planned: { label: "Planned", tone: "neutral", icon: CalendarClock },
} as const satisfies Record<string, StatusConfig>;

export type StatusKey = keyof typeof STATUS_CONFIG;

export const STATUS_TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error",
  info: "bg-info-soft text-info",
  neutral: "bg-surface text-fg-muted",
};
