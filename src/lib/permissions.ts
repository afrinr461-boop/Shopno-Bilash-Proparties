import { ROLE_PERMISSIONS, type Permission } from "@/config/permissions";
import type { RoleName } from "@/config/roles";

/**
 * The single place permission checks happen. Components and API route
 * handlers call this rather than inspecting `role` directly, so the
 * role → permission mapping can change without touching call sites.
 */
export function hasPermission(role: RoleName, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: RoleName, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: RoleName, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
