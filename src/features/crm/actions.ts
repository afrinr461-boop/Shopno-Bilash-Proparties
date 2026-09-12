"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { leadRepository } from "@/features/crm/repository";
import { projectRepository } from "@/features/projects/repository";
import { unitRepository } from "@/features/units/repository";
import { userRepository } from "@/features/users/repository";
import type { LeadStatus, LeadPriority } from "@/types/crm";

export interface LeadFormState {
  error?: string;
}

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "interested",
  "site-visit",
  "negotiation",
  "booking",
  "won",
  "lost",
];

function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as string[]).includes(value);
}

const LEAD_PRIORITIES: LeadPriority[] = ["low", "medium", "high", "urgent"];
function isLeadPriority(value: string): value is LeadPriority {
  return (LEAD_PRIORITIES as string[]).includes(value);
}

function toOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

async function requireLeadPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "lead.manage")) throw new Error("Forbidden");
  return user;
}

async function parseLeadFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const interestedProjectId = String(formData.get("interestedProjectId") ?? "").trim();
  const interestedUnitId = String(formData.get("interestedUnitId") ?? "").trim();
  const assignedSalespersonId = String(formData.get("assignedSalespersonId") ?? "").trim();
  const budgetRaw = String(formData.get("budget") ?? "");
  const nextFollowUpAt = String(formData.get("nextFollowUpAt") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const priority = String(formData.get("priority") ?? "").trim();

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." } as const;
  if (!phone) return { error: "Enter a phone number." } as const;
  if (!source) return { error: "Enter a source, e.g. \"Website\" or \"Referral\"." } as const;
  if (!isLeadStatus(status)) return { error: "Choose a valid status." } as const;
  if (priority && !isLeadPriority(priority)) return { error: "Choose a valid priority." } as const;

  if (interestedProjectId) {
    const project = await projectRepository.findById(interestedProjectId);
    if (!project) return { error: "That project no longer exists." } as const;
  }
  if (interestedUnitId) {
    const unit = await unitRepository.findById(interestedUnitId);
    if (!unit) return { error: "That unit no longer exists." } as const;
  }
  if (assignedSalespersonId) {
    const salesperson = await userRepository.findById(assignedSalespersonId);
    if (!salesperson) return { error: "That user no longer exists." } as const;
  }

  return {
    fields: {
      name,
      phone,
      email: email || undefined,
      source,
      status,
      interestedProjectId: interestedProjectId || undefined,
      interestedUnitId: interestedUnitId || undefined,
      assignedSalespersonId: assignedSalespersonId || undefined,
      budget: toOptionalNumber(budgetRaw),
      nextFollowUpAt: nextFollowUpAt || undefined,
      notes: notes || undefined,
      priority: (priority || undefined) as LeadPriority | undefined,
    },
  } as const;
}

export async function createLead(_prevState: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const user = await requireLeadPermission();

  const parsed = await parseLeadFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await leadRepository.create({
    id,
    name: fields.name,
    phone: fields.phone,
    email: fields.email,
    source: fields.source,
    interestedProjectId: fields.interestedProjectId,
    interestedUnitId: fields.interestedUnitId,
    budget: fields.budget !== undefined ? { amount: fields.budget, currency: "BDT" } : undefined,
    notes: fields.notes,
    assignedSalespersonId: fields.assignedSalespersonId,
    nextFollowUpAt: fields.nextFollowUpAt,
    status: fields.status,
    priority: fields.priority,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "lead.create", entityType: "Lead", entityId: id });

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

export async function updateLead(id: string, _prevState: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const user = await requireLeadPermission();

  const parsed = await parseLeadFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await leadRepository.findById(id);
  if (!existing) return { error: "This lead no longer exists." };

  const updated = await leadRepository.update(id, {
    name: fields.name,
    phone: fields.phone,
    email: fields.email,
    source: fields.source,
    interestedProjectId: fields.interestedProjectId,
    interestedUnitId: fields.interestedUnitId,
    budget: fields.budget !== undefined ? { amount: fields.budget, currency: "BDT" } : undefined,
    notes: fields.notes,
    assignedSalespersonId: fields.assignedSalespersonId,
    nextFollowUpAt: fields.nextFollowUpAt,
    status: fields.status,
    priority: fields.priority,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This lead no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "lead.update", entityType: "Lead", entityId: id });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  redirect(`/admin/leads/${id}`);
}

export async function deleteLead(id: string): Promise<void> {
  const user = await requireLeadPermission();

  const existing = await leadRepository.findById(id);
  if (!existing) return;

  await leadRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "lead.delete", entityType: "Lead", entityId: id });

  revalidatePath("/admin/leads");
}
