import type { AuditFields, ID, Money } from "./common";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "interested"
  | "site-visit"
  | "negotiation"
  | "booking"
  | "won"
  | "lost";

export type LeadPriority = "low" | "medium" | "high" | "urgent";

export type LeadActivityType = "call" | "message" | "meeting" | "site-visit" | "whatsapp" | "email" | "follow-up" | "note";

export interface LeadActivity {
  id: ID;
  leadId: ID;
  type: LeadActivityType;
  note: string;
  occurredAt: string;
  createdBy: ID;
}

export interface Lead extends AuditFields {
  id: ID;
  name: string;
  phone: string;
  email?: string;
  source: string;
  interestedProjectId?: ID;
  interestedUnitId?: ID;
  budget?: Money;
  notes?: string;
  assignedSalespersonId?: ID;
  nextFollowUpAt?: string;
  status: LeadStatus;
  priority?: LeadPriority;
}
