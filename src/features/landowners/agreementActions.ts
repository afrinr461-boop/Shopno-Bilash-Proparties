"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { agreementRepository } from "@/features/landowners/repository";
import { projectRepository } from "@/features/projects/repository";
import type { AgreementStatus } from "@/types/landowner";

export interface AgreementFormState {
  error?: string;
}

const AGREEMENT_STATUSES: AgreementStatus[] = [
  "proposed",
  "under-review",
  "signed",
  "active",
  "completed",
  "terminated",
];

function isAgreementStatus(value: string): value is AgreementStatus {
  return (AGREEMENT_STATUSES as string[]).includes(value);
}

async function requireLandownerPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "landowner.manage")) throw new Error("Forbidden");
  return user;
}

async function parseAgreementFields(formData: FormData) {
  const landownerId = String(formData.get("landownerId") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const termsSummary = String(formData.get("termsSummary") ?? "").trim();
  const signedDate = String(formData.get("signedDate") ?? "").trim();

  if (!landownerId) return { error: "Missing landowner." } as const;
  if (projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) return { error: "That project no longer exists." } as const;
  }
  if (!isAgreementStatus(status)) return { error: "Choose a valid status." } as const;
  if (!termsSummary || termsSummary.length < 5) return { error: "Describe the terms, e.g. \"35% of built units\"." } as const;

  return { fields: { landownerId, projectId: projectId || undefined, status, termsSummary, signedDate: signedDate || undefined } } as const;
}

export async function createAgreement(_prevState: AgreementFormState, formData: FormData): Promise<AgreementFormState> {
  const user = await requireLandownerPermission();

  const parsed = await parseAgreementFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await agreementRepository.create({
    id,
    landownerId: fields.landownerId,
    projectId: fields.projectId,
    status: fields.status,
    termsSummary: fields.termsSummary,
    signedDate: fields.signedDate,
    documentIds: [],
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "agreement.create", entityType: "Agreement", entityId: id });

  revalidatePath(`/admin/landowners/${fields.landownerId}`);
  redirect(`/admin/landowners/${fields.landownerId}`);
}

export async function updateAgreement(
  id: string,
  _prevState: AgreementFormState,
  formData: FormData,
): Promise<AgreementFormState> {
  const user = await requireLandownerPermission();

  const parsed = await parseAgreementFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await agreementRepository.findById(id);
  if (!existing) return { error: "This agreement no longer exists." };

  const updated = await agreementRepository.update(id, {
    projectId: fields.projectId,
    status: fields.status,
    termsSummary: fields.termsSummary,
    signedDate: fields.signedDate,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This agreement no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "agreement.update", entityType: "Agreement", entityId: id });

  revalidatePath(`/admin/landowners/${fields.landownerId}`);
  redirect(`/admin/landowners/${fields.landownerId}`);
}

export async function deleteAgreement(landownerId: string, id: string): Promise<void> {
  const user = await requireLandownerPermission();

  const existing = await agreementRepository.findById(id);
  if (!existing) return;

  await agreementRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "agreement.delete", entityType: "Agreement", entityId: id });

  revalidatePath(`/admin/landowners/${landownerId}`);
}
