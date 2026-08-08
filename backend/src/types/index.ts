export const ROLES = [
  "super_admin",
  "admin",
  "project_manager",
  "marketing_manager",
  "content_editor",
  "developer",
] as const;

export type Role = (typeof ROLES)[number];

/** Highest to lowest privilege, used for RBAC checks. */
export const ROLE_LEVEL: Record<Role, number> = {
  super_admin: 5,
  admin: 4,
  project_manager: 3,
  marketing_manager: 2,
  content_editor: 1,
  developer: 0,
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  project_manager: "Project Manager",
  marketing_manager: "Marketing Manager",
  content_editor: "Content Editor",
  developer: "Developer",
};

/**
 * Canonical permission names. The `Role` documents in the database mirror these
 * (see scripts/seed.ts). `requirePermission()` in middleware/auth.ts is the
 * enforcement point; the frontend only hides UI for users without a permission.
 */
export const PERMISSIONS = [
  // Dashboard / system
  "dashboard:view",
  "audit:view",
  "system:configure",
  // CRM
  "leads:view",
  "leads:create",
  "leads:update",
  "leads:delete",
  "leads:assign",
  "leads:export",
  "contacts:view",
  "contacts:reply",
  "contacts:update",
  "contacts:delete",
  // Content
  "content:view",
  "content:create",
  "content:update",
  "content:delete",
  "blogs:publish",
  // Tools
  "media:manage",
  "seo:manage",
  "settings:manage",
  "analytics:view",
  // System
  "users:manage",
  "roles:manage",
  // Tasks / points / attendance
  "tasks:view",
  "tasks:view_all",
  "tasks:create",
  "tasks:update",
  "tasks:delete",
  "tasks:submit",
  "tasks:verify",
  "attendance:view",
  "attendance:view_all",
  "payroll:view",
] as const;

export type PermissionName = (typeof PERMISSIONS)[number];

/** Built-in permission map per system role. `super_admin` bypasses checks. */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [...PERMISSIONS],
  admin: [...PERMISSIONS],
  project_manager: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:update",
    "leads:delete",
    "leads:assign",
    "leads:export",
    "contacts:view",
    "contacts:reply",
    "contacts:update",
    "contacts:delete",
    "content:view",
    "content:create",
    "content:update",
    "content:delete",
    "media:manage",
    "analytics:view",
    "tasks:view",
    "tasks:view_all",
    "tasks:create",
    "tasks:update",
    "tasks:delete",
    "tasks:verify",
    "attendance:view",
    "attendance:view_all",
    "payroll:view",
  ],
  marketing_manager: [
    "dashboard:view",
    "leads:view",
    "leads:update",
    "contacts:view",
    "contacts:reply",
    "content:view",
    "content:create",
    "content:update",
    "blogs:publish",
    "media:manage",
    "seo:manage",
    "analytics:view",
  ],
  content_editor: [
    "dashboard:view",
    "leads:view",
    "content:view",
    "content:create",
    "content:update",
    "blogs:publish",
    "analytics:view",
  ],
  developer: [
    "tasks:view",
    "tasks:submit",
    "attendance:view",
    "payroll:view",
  ],
};

export const PORTFOLIO_STATUS = ["draft", "published", "hidden"] as const;

export const LEAD_STATUS = ["new", "contacted", "in_progress", "quoted", "won", "lost"] as const;

export type LeadStatus = (typeof LEAD_STATUS)[number];
