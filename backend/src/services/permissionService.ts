import { RoleModel } from "../models/Role";
import { ROLE_PERMISSIONS } from "../types";

/**
 * Effective permission set for a role:
 * built-in map (types/index.ts) ∪ custom permissions from the `Role` document.
 * A short-lived cache avoids a DB read on every request.
 */
const cache = new Map<string, { perms: string[]; at: number }>();
const TTL_MS = 15_000;

export async function getEffectivePermissions(role: string): Promise<string[]> {
  const builtin = ROLE_PERMISSIONS[role] ?? [];
  let custom: string[] = [];

  const cached = cache.get(role);
  if (cached && Date.now() - cached.at < TTL_MS) {
    custom = cached.perms;
  } else {
  try {
    const doc = (await RoleModel.findOne({ name: role }).select("permissions").lean()) as unknown as { permissions?: string[] } | null;
    custom = doc?.permissions ?? [];
    cache.set(role, { perms: custom, at: Date.now() });
  } catch {
    custom = [];
  }
  }

  return Array.from(new Set([...builtin, ...custom]));
}

/** Drops the cached permissions for a role so edits take effect immediately. */
export function invalidateRoleCache(role: string) {
  cache.delete(role);
}
