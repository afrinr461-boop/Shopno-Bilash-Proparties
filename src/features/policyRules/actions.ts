"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { policyRuleRepository } from "@/features/policyRules/repository";

export interface PolicyRuleFormState {
  error?: string;
}

async function requireContentPermission(permission: "content.create" | "content.update" | "content.delete") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

function parsePolicyRuleFields(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  if (!text || text.length < 4) return { error: "Enter the rule's text." } as const;
  return { fields: { text } } as const;
}

export async function createPolicyRule(_prevState: PolicyRuleFormState, formData: FormData): Promise<PolicyRuleFormState> {
  const user = await requireContentPermission("content.create");

  const parsed = parsePolicyRuleFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const id = randomUUID();
  const now = new Date().toISOString();
  await policyRuleRepository.create({
    id,
    ...fields,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "content.policyRule.create", entityType: "PolicyRule", entityId: id });

  revalidatePath("/policy");
  revalidatePath("/admin/content/policy");
  redirect("/admin/content/policy");
}

export async function updatePolicyRule(id: string, _prevState: PolicyRuleFormState, formData: FormData): Promise<PolicyRuleFormState> {
  const user = await requireContentPermission("content.update");

  const parsed = parsePolicyRuleFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const updated = await policyRuleRepository.update(id, {
    ...fields,
    updatedAt: new Date().toISOString(),
    updatedBy: user.id,
  });
  if (!updated) return { error: "This rule no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "content.policyRule.update", entityType: "PolicyRule", entityId: id });

  revalidatePath("/policy");
  revalidatePath("/admin/content/policy");
  redirect("/admin/content/policy");
}

export async function deletePolicyRule(id: string): Promise<void> {
  const user = await requireContentPermission("content.delete");

  const existing = await policyRuleRepository.findById(id);
  if (!existing) return;

  await policyRuleRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "content.policyRule.delete", entityType: "PolicyRule", entityId: id });

  revalidatePath("/policy");
  revalidatePath("/admin/content/policy");
}
