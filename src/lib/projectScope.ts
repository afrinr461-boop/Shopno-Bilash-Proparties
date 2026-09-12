import type { User } from "@/types/user";

/**
 * The one place "which projects can this user see" is decided —
 * per-project data segregation. `super_admin`/`managing_director` always
 * see everything (matches that they already hold every permission);
 * every other staff role is scoped to `User.assignedProjectIds`.
 */
export function getVisibleProjectIds(user: User): "all" | string[] {
  if (user.role === "super_admin" || user.role === "managing_director") return "all";
  return user.assignedProjectIds ?? [];
}

export function canAccessProject(user: User, projectId: string): boolean {
  const scope = getVisibleProjectIds(user);
  return scope === "all" || scope.includes(projectId);
}

/** Filters any list of project-scoped records down to what `user` may see. */
export function filterToVisibleProjects<T extends { projectId: string }>(user: User, items: T[]): T[] {
  const scope = getVisibleProjectIds(user);
  return scope === "all" ? items : items.filter((item) => scope.includes(item.projectId));
}

/** Same as `filterToVisibleProjects`, for a list of Projects themselves (keyed by `id`, not `.projectId`). */
export function filterVisibleProjectsList<T extends { id: string }>(user: User, projects: T[]): T[] {
  const scope = getVisibleProjectIds(user);
  return scope === "all" ? projects : projects.filter((p) => scope.includes(p.id));
}

/**
 * For records where the project link is genuinely optional (a Payment
 * with no `projectId`, a general Lead not tied to one project) — a record
 * with no project set is a general/unscoped record, not a hidden one, so
 * it stays visible to everyone regardless of assignment.
 */
export function filterToVisibleProjectsOptional<T extends { projectId?: string }>(user: User, items: T[]): T[] {
  const scope = getVisibleProjectIds(user);
  return scope === "all" ? items : items.filter((item) => !item.projectId || scope.includes(item.projectId));
}

export function canAccessProjectOptional(user: User, projectId: string | undefined): boolean {
  if (!projectId) return true;
  return canAccessProject(user, projectId);
}
