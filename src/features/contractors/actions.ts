"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { contractorRepository } from "@/features/contractors/repository";
import { constructionPhaseRepository, constructionTaskRepository } from "@/features/construction/repository";
import type { LifecycleStatus } from "@/types/contractor";

export interface ContractorFormState {
  error?: string;
}

async function requireConstructionPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "construction.manage")) throw new Error("Forbidden");
  return user;
}

function parseContractorFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactPerson = String(formData.get("contactPerson") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." } as const;
  if (!phone) return { error: "Enter a phone number." } as const;

  return {
    fields: {
      name,
      companyName: companyName || undefined,
      contactPerson: contactPerson || undefined,
      phone,
      email: email || undefined,
      address: address || undefined,
      specialty: specialty || undefined,
      notes: notes || undefined,
    },
  } as const;
}

/** A contractor is not bound to one project — one contractor can work on many stages/projects over time (§15), so this record carries no `projectId`. */
export async function createContractor(_prevState: ContractorFormState, formData: FormData): Promise<ContractorFormState> {
  const user = await requireConstructionPermission();

  const parsed = parseContractorFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await contractorRepository.create({
    id,
    name: fields.name,
    companyName: fields.companyName,
    contactPerson: fields.contactPerson,
    phone: fields.phone,
    email: fields.email,
    address: fields.address,
    specialty: fields.specialty,
    notes: fields.notes,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "contractor.create", entityType: "Contractor", entityId: id });

  revalidatePath("/admin/construction/contractors");
  redirect(`/admin/construction/contractors/${id}`);
}

export async function updateContractor(id: string, _prevState: ContractorFormState, formData: FormData): Promise<ContractorFormState> {
  const user = await requireConstructionPermission();

  const parsed = parseContractorFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await contractorRepository.findById(id);
  if (!existing) return { error: "This contractor no longer exists." };

  await contractorRepository.update(id, {
    name: fields.name,
    companyName: fields.companyName,
    contactPerson: fields.contactPerson,
    phone: fields.phone,
    email: fields.email,
    address: fields.address,
    specialty: fields.specialty,
    notes: fields.notes,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });

  await recordAuditEvent({ actorUserId: user.id, action: "contractor.update", entityType: "Contractor", entityId: id });

  revalidatePath("/admin/construction/contractors");
  revalidatePath(`/admin/construction/contractors/${id}`);
  redirect(`/admin/construction/contractors/${id}`);
}

/** Hard delete only when this contractor has no phase/task assignment history — otherwise use `setContractorStatus` to retire it. */
export async function deleteContractor(id: string): Promise<{ error?: string }> {
  const user = await requireConstructionPermission();

  const [phases, tasks] = await Promise.all([constructionPhaseRepository.list(), constructionTaskRepository.list()]);
  if (phases.some((p) => p.contractorId === id) || tasks.some((t) => t.contractorId === id)) {
    return { error: "This contractor is assigned to phases or tasks — set it to Inactive instead of deleting." };
  }

  await contractorRepository.remove(id);
  await recordAuditEvent({ actorUserId: user.id, action: "contractor.delete", entityType: "Contractor", entityId: id });

  revalidatePath("/admin/construction/contractors");
  return {};
}

export async function setContractorStatus(id: string, status: LifecycleStatus): Promise<{ error?: string }> {
  const user = await requireConstructionPermission();

  const existing = await contractorRepository.findById(id);
  if (!existing) return { error: "This contractor no longer exists." };

  await contractorRepository.update(id, { status, updatedBy: user.id, updatedAt: new Date().toISOString() });
  await recordAuditEvent({ actorUserId: user.id, action: "contractor.setStatus", entityType: "Contractor", entityId: id });

  revalidatePath("/admin/construction/contractors");
  revalidatePath(`/admin/construction/contractors/${id}`);
  return {};
}
