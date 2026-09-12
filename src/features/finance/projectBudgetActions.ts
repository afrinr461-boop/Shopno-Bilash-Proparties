"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { projectBudgetRepository } from "@/features/finance/repository";
import { projectRepository } from "@/features/projects/repository";

export interface ProjectBudgetFormState {
  error?: string;
}

async function requireFinancePermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "finance.manage")) throw new Error("Forbidden");
  return user;
}

async function parseProjectBudgetFields(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const budgetedRaw = String(formData.get("budgeted") ?? "");
  const actualRaw = String(formData.get("actual") ?? "");
  const reference = String(formData.get("reference") ?? "").trim();
  const phaseId = String(formData.get("phaseId") ?? "").trim();
  const warningThresholdRaw = String(formData.get("warningThresholdPct") ?? "").trim();
  const overThresholdRaw = String(formData.get("overThresholdPct") ?? "").trim();

  if (!projectId) return { error: "Choose a project." } as const;
  const project = await projectRepository.findById(projectId);
  if (!project) return { error: "That project no longer exists." } as const;
  if (!category || category.length < 2) return { error: "Enter a category, e.g. \"Materials\" or \"Labor\"." } as const;
  if (!date) return { error: "Enter a date." } as const;

  const budgeted = Number(budgetedRaw);
  if (!Number.isFinite(budgeted) || budgeted <= 0) return { error: "Enter a valid budgeted amount." } as const;

  const actual = Number(actualRaw);
  if (!Number.isFinite(actual) || actual < 0) return { error: "Enter a valid actual amount." } as const;

  const warningThresholdPct = warningThresholdRaw ? Number(warningThresholdRaw) : undefined;
  const overThresholdPct = overThresholdRaw ? Number(overThresholdRaw) : undefined;

  return {
    fields: {
      projectId,
      category,
      date,
      budgeted,
      actual,
      reference: reference || undefined,
      phaseId: phaseId || undefined,
      warningThresholdPct: Number.isFinite(warningThresholdPct) ? warningThresholdPct : undefined,
      overThresholdPct: Number.isFinite(overThresholdPct) ? overThresholdPct : undefined,
    },
  } as const;
}

export async function createProjectBudget(
  _prevState: ProjectBudgetFormState,
  formData: FormData,
): Promise<ProjectBudgetFormState> {
  const user = await requireFinancePermission();

  const parsed = await parseProjectBudgetFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();

  await projectBudgetRepository.create({
    id,
    date: fields.date,
    category: fields.category,
    projectId: fields.projectId,
    reference: fields.reference,
    amount: { amount: fields.actual, currency: "BDT" },
    budgeted: { amount: fields.budgeted, currency: "BDT" },
    actual: { amount: fields.actual, currency: "BDT" },
    phaseId: fields.phaseId,
    warningThresholdPct: fields.warningThresholdPct,
    overThresholdPct: fields.overThresholdPct,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "projectBudget.create", entityType: "ProjectBudget", entityId: id });

  revalidatePath("/admin/finance/project-costs");
  redirect("/admin/finance/project-costs");
}

export async function updateProjectBudget(
  id: string,
  _prevState: ProjectBudgetFormState,
  formData: FormData,
): Promise<ProjectBudgetFormState> {
  const user = await requireFinancePermission();

  const parsed = await parseProjectBudgetFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await projectBudgetRepository.findById(id);
  if (!existing) return { error: "This budget line no longer exists." };

  const updated = await projectBudgetRepository.update(id, {
    date: fields.date,
    category: fields.category,
    projectId: fields.projectId,
    reference: fields.reference,
    amount: { amount: fields.actual, currency: "BDT" },
    budgeted: { amount: fields.budgeted, currency: "BDT" },
    actual: { amount: fields.actual, currency: "BDT" },
    phaseId: fields.phaseId,
    warningThresholdPct: fields.warningThresholdPct,
    overThresholdPct: fields.overThresholdPct,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This budget line no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "projectBudget.update", entityType: "ProjectBudget", entityId: id });

  revalidatePath("/admin/finance/project-costs");
  revalidatePath(`/admin/finance/project-costs/${id}`);
  redirect(`/admin/finance/project-costs/${id}`);
}

export async function deleteProjectBudget(id: string): Promise<void> {
  const user = await requireFinancePermission();

  const existing = await projectBudgetRepository.findById(id);
  if (!existing) return;

  await projectBudgetRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "projectBudget.delete", entityType: "ProjectBudget", entityId: id });

  revalidatePath("/admin/finance/project-costs");
}
