"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { companyMilestoneRepository } from "@/features/companyMilestones/repository";
import { MILESTONE_ICONS, type MilestoneIconKey } from "@/types/companyMilestone";

export interface MilestoneFormState {
  error?: string;
}

function isMilestoneIcon(value: string): value is MilestoneIconKey {
  return (MILESTONE_ICONS as readonly string[]).includes(value);
}

async function requireContentPermission(permission: "content.create" | "content.update" | "content.delete") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

function parseMilestoneFields(formData: FormData) {
  const year = String(formData.get("year") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const icon = String(formData.get("icon") ?? "");

  if (!/^\d{4}$/.test(year)) return { error: "Enter a 4-digit year, e.g. 2026." } as const;
  if (!title || title.length < 2) return { error: "Enter a title." } as const;
  if (!summary || summary.length < 4) return { error: "Enter a short summary." } as const;
  if (!isMilestoneIcon(icon)) return { error: "Choose an icon." } as const;

  return { fields: { year, title, summary, details: details || undefined, icon } } as const;
}

export async function createMilestone(_prevState: MilestoneFormState, formData: FormData): Promise<MilestoneFormState> {
  const user = await requireContentPermission("content.create");

  const parsed = parseMilestoneFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();
  await companyMilestoneRepository.create({
    id,
    ...fields,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "content.milestone.create", entityType: "CompanyMilestone", entityId: id });

  revalidatePath("/about");
  revalidatePath("/admin/content/story");
  redirect("/admin/content/story");
}

export async function updateMilestone(id: string, _prevState: MilestoneFormState, formData: FormData): Promise<MilestoneFormState> {
  const user = await requireContentPermission("content.update");

  const parsed = parseMilestoneFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const updated = await companyMilestoneRepository.update(id, {
    ...fields,
    updatedAt: new Date().toISOString(),
    updatedBy: user.id,
  });
  if (!updated) return { error: "This entry no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "content.milestone.update", entityType: "CompanyMilestone", entityId: id });

  revalidatePath("/about");
  revalidatePath("/admin/content/story");
  redirect("/admin/content/story");
}

export async function deleteMilestone(id: string): Promise<void> {
  const user = await requireContentPermission("content.delete");

  const existing = await companyMilestoneRepository.findById(id);
  if (!existing) return;

  await companyMilestoneRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "content.milestone.delete", entityType: "CompanyMilestone", entityId: id });

  revalidatePath("/about");
  revalidatePath("/admin/content/story");
}
