export const ROLES = [
  "super_admin",
  "admin",
  "project_manager",
  "marketing_manager",
  "content_editor",
] as const;

export type Role = (typeof ROLES)[number];

/** Highest to lowest privilege, used for RBAC checks. */
export const ROLE_LEVEL: Record<Role, number> = {
  super_admin: 5,
  admin: 4,
  project_manager: 3,
  marketing_manager: 2,
  content_editor: 1,
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  project_manager: "Project Manager",
  marketing_manager: "Marketing Manager",
  content_editor: "Content Editor",
};

export const PORTFOLIO_STATUS = ["draft", "published", "hidden"] as const;

export const LEAD_STATUS = ["new", "contacted", "in_progress", "quoted", "won", "lost"] as const;

export type LeadStatus = (typeof LEAD_STATUS)[number];
