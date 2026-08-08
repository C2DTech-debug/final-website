import type { AdminUser } from "@/types";

export const isSuperAdmin = (user?: AdminUser | null): boolean => user?.role === "super_admin";

/**
 * Client-side permission check. The backend is the source of truth — this only
 * hides navigation/actions so a missing permission surfaces as a 403 from the
 * API instead of a broken page.
 */
export function hasPermission(user: AdminUser | null | undefined, permission: string): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return (user.permissions ?? []).includes(permission);
}

export function hasAnyPermission(user: AdminUser | null | undefined, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(user, p));
}
