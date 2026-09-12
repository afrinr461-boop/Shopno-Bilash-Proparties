"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { contractorAssignmentRepository, contractorRepository } from "@/features/contractors/repository";
import { constructionPhaseRepository, constructionTaskRepository } from "@/features/construction/repository";

async function requireConstructionPermission() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "construction.manage")) throw new Error("Forbidden");
  return user;
}

/**
 * Assigns (or reassigns) a contractor to a phase or task — exactly one of
 * `phaseId`/`taskId` should be set. Closes any currently-open assignment
 * for that phase/task first (never overwritten with no trace, §16), then
 * opens a new one and updates the phase/task's own `contractorId` pointer
 * for fast reads. The old assignment's `unassignedDate` is the permanent
 * record that a different contractor held this work before.
 */
export async function assignContractor(
  target: { phaseId?: string; taskId?: string },
  contractorId: string,
  notes?: string,
): Promise<{ error?: string }> {
  const user = await requireConstructionPermission();

  if (!target.phaseId && !target.taskId) return { error: "Choose a phase or task to assign." };

  const contractor = await contractorRepository.findById(contractorId);
  if (!contractor) return { error: "This contractor no longer exists." };

  let projectId: string;
  if (target.phaseId) {
    const phase = await constructionPhaseRepository.findById(target.phaseId);
    if (!phase) return { error: "This phase no longer exists." };
    projectId = phase.projectId;
  } else {
    const task = await constructionTaskRepository.findById(target.taskId!);
    if (!task) return { error: "This task no longer exists." };
    projectId = task.projectId;
  }

  const now = new Date().toISOString();
  const allAssignments = await contractorAssignmentRepository.list();
  const openAssignment = allAssignments.find(
    (a) => !a.unassignedDate && (target.phaseId ? a.phaseId === target.phaseId : a.taskId === target.taskId),
  );
  if (openAssignment) {
    if (openAssignment.contractorId === contractorId) return {}; // already assigned, nothing to do
    await contractorAssignmentRepository.update(openAssignment.id, { unassignedDate: now, updatedBy: user.id, updatedAt: now });
  }

  const id = randomUUID();
  await contractorAssignmentRepository.create({
    id,
    projectId,
    phaseId: target.phaseId,
    taskId: target.taskId,
    contractorId,
    assignedDate: now,
    notes: notes || undefined,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  if (target.phaseId) {
    await constructionPhaseRepository.update(target.phaseId, { contractorId, updatedBy: user.id, updatedAt: now });
  } else {
    await constructionTaskRepository.update(target.taskId!, { contractorId, updatedBy: user.id, updatedAt: now });
  }

  await recordAuditEvent({ actorUserId: user.id, action: "contractorAssignment.create", entityType: "ContractorAssignment", entityId: id });

  revalidatePath("/admin/construction");
  if (target.phaseId) revalidatePath(`/admin/construction/${target.phaseId}`);
  return {};
}

/** Removes a contractor from a phase/task without assigning a replacement — closes the open span, clears the fast pointer, keeps the history. */
export async function unassignContractor(target: { phaseId?: string; taskId?: string }): Promise<{ error?: string }> {
  const user = await requireConstructionPermission();
  if (!target.phaseId && !target.taskId) return { error: "Choose a phase or task." };

  const now = new Date().toISOString();
  const allAssignments = await contractorAssignmentRepository.list();
  const openAssignment = allAssignments.find(
    (a) => !a.unassignedDate && (target.phaseId ? a.phaseId === target.phaseId : a.taskId === target.taskId),
  );
  if (openAssignment) {
    await contractorAssignmentRepository.update(openAssignment.id, { unassignedDate: now, updatedBy: user.id, updatedAt: now });
  }

  if (target.phaseId) {
    await constructionPhaseRepository.update(target.phaseId, { contractorId: undefined, updatedBy: user.id, updatedAt: now });
  } else {
    await constructionTaskRepository.update(target.taskId!, { contractorId: undefined, updatedBy: user.id, updatedAt: now });
  }

  revalidatePath("/admin/construction");
  if (target.phaseId) revalidatePath(`/admin/construction/${target.phaseId}`);
  return {};
}
