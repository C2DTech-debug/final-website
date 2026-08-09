/**
 * Granular permission catalog — the single source of truth for the backend.
 * The `Permission` collection is seeded from this (scripts/seed.ts), and the
 * frontend mirrors `PERMISSIONS` in frontend/src/types/index.ts.
 *
 * Convention: <module>:<action>. Each content module (services, portfolio,
 * team, testimonials, faqs, blogs, careers) has its own view/create/update/
 * delete pair, so admins can grant very specific access.
 */
export interface PermissionDef {
  name: string;
  label: string;
  description: string;
  module: string;
  action: string;
  group: string;
}

export const PERMISSION_CATALOG: PermissionDef[] = [
  // ---- Dashboard ----
  { name: "dashboard:view", label: "View dashboard", description: "See the dashboard overview and notifications.", module: "dashboard", action: "view", group: "Dashboard" },

  // ---- Analytics ----
  { name: "analytics:view", label: "View analytics", description: "See visitor analytics and marketing reports.", module: "analytics", action: "view", group: "Analytics" },

  // ---- CRM: leads ----
  { name: "leads:view", label: "View leads", description: "See the CRM lead pipeline and lead details.", module: "leads", action: "view", group: "CRM" },
  { name: "leads:create", label: "Create leads", description: "Add new leads manually or by import.", module: "leads", action: "create", group: "CRM" },
  { name: "leads:update", label: "Update leads", description: "Edit lead fields, status, priority and notes.", module: "leads", action: "update", group: "CRM" },
  { name: "leads:delete", label: "Delete leads", description: "Delete leads and their notes.", module: "leads", action: "delete", group: "CRM" },
  { name: "leads:assign", label: "Assign leads", description: "Assign or transfer leads between team members.", module: "leads", action: "assign", group: "CRM" },
  { name: "leads:export", label: "Export leads", description: "Download leads as CSV, Excel or PDF.", module: "leads", action: "export", group: "CRM" },

  // ---- CRM: contacts / enquiries ----
  { name: "contacts:view", label: "View enquiries", description: "See contact-form enquiries.", module: "contacts", action: "view", group: "CRM" },
  { name: "contacts:update", label: "Update enquiries", description: "Change enquiry status and assignment.", module: "contacts", action: "update", group: "CRM" },
  { name: "contacts:reply", label: "Reply to enquiries", description: "Send email replies to enquiries.", module: "contacts", action: "reply", group: "CRM" },
  { name: "contacts:delete", label: "Delete enquiries", description: "Delete contact-form enquiries.", module: "contacts", action: "delete", group: "CRM" },

  // ---- Estimates ----
  { name: "estimates:view", label: "View estimates", description: "See project estimates from the estimator.", module: "estimates", action: "view", group: "Estimates" },
  { name: "estimates:update", label: "Update estimates", description: "Change estimate status and assignment.", module: "estimates", action: "update", group: "Estimates" },
  { name: "estimates:delete", label: "Delete estimates", description: "Delete project estimates.", module: "estimates", action: "delete", group: "Estimates" },

  // ---- Services ----
  { name: "services:view", label: "View services", description: "See the services list and details.", module: "services", action: "view", group: "Services" },
  { name: "services:create", label: "Create services", description: "Add new services.", module: "services", action: "create", group: "Services" },
  { name: "services:update", label: "Edit services", description: "Edit service content and pricing.", module: "services", action: "update", group: "Services" },
  { name: "services:delete", label: "Delete services", description: "Delete services.", module: "services", action: "delete", group: "Services" },

  // ---- Portfolio ----
  { name: "portfolio:view", label: "View portfolio", description: "See portfolio projects.", module: "portfolio", action: "view", group: "Portfolio" },
  { name: "portfolio:create", label: "Create portfolio items", description: "Add new portfolio projects.", module: "portfolio", action: "create", group: "Portfolio" },
  { name: "portfolio:update", label: "Edit portfolio items", description: "Edit portfolio project details.", module: "portfolio", action: "update", group: "Portfolio" },
  { name: "portfolio:delete", label: "Delete portfolio items", description: "Delete portfolio projects.", module: "portfolio", action: "delete", group: "Portfolio" },

  // ---- Team ----
  { name: "team:view", label: "View team", description: "See team member profiles.", module: "team", action: "view", group: "Team" },
  { name: "team:create", label: "Create team members", description: "Add new team members.", module: "team", action: "create", group: "Team" },
  { name: "team:update", label: "Edit team members", description: "Edit team member profiles.", module: "team", action: "update", group: "Team" },
  { name: "team:delete", label: "Delete team members", description: "Delete team members.", module: "team", action: "delete", group: "Team" },

  // ---- Testimonials ----
  { name: "testimonials:view", label: "View testimonials", description: "See client testimonials.", module: "testimonials", action: "view", group: "Testimonials" },
  { name: "testimonials:create", label: "Create testimonials", description: "Add new testimonials.", module: "testimonials", action: "create", group: "Testimonials" },
  { name: "testimonials:update", label: "Edit testimonials", description: "Edit testimonials.", module: "testimonials", action: "update", group: "Testimonials" },
  { name: "testimonials:delete", label: "Delete testimonials", description: "Delete testimonials.", module: "testimonials", action: "delete", group: "Testimonials" },

  // ---- FAQs ----
  { name: "faqs:view", label: "View FAQs", description: "See the FAQ list.", module: "faqs", action: "view", group: "FAQs" },
  { name: "faqs:create", label: "Create FAQs", description: "Add new FAQs.", module: "faqs", action: "create", group: "FAQs" },
  { name: "faqs:update", label: "Edit FAQs", description: "Edit FAQs.", module: "faqs", action: "update", group: "FAQs" },
  { name: "faqs:delete", label: "Delete FAQs", description: "Delete FAQs.", module: "faqs", action: "delete", group: "FAQs" },

  // ---- Blog ----
  { name: "blogs:view", label: "View blog", description: "See blog posts.", module: "blogs", action: "view", group: "Blog" },
  { name: "blogs:create", label: "Create blog posts", description: "Add new blog posts.", module: "blogs", action: "create", group: "Blog" },
  { name: "blogs:update", label: "Edit blog posts", description: "Edit blog posts and their SEO.", module: "blogs", action: "update", group: "Blog" },
  { name: "blogs:delete", label: "Delete blog posts", description: "Delete blog posts.", module: "blogs", action: "delete", group: "Blog" },
  { name: "blogs:publish", label: "Publish blog posts", description: "Publish or take down blog posts.", module: "blogs", action: "publish", group: "Blog" },

  // ---- Careers ----
  { name: "careers:view", label: "View jobs", description: "See job openings.", module: "careers", action: "view", group: "Careers" },
  { name: "careers:create", label: "Create jobs", description: "Add new job openings.", module: "careers", action: "create", group: "Careers" },
  { name: "careers:update", label: "Edit jobs", description: "Edit job openings.", module: "careers", action: "update", group: "Careers" },
  { name: "careers:delete", label: "Delete jobs", description: "Delete job openings.", module: "careers", action: "delete", group: "Careers" },
  { name: "applications:view", label: "View applications", description: "See job applications.", module: "careers", action: "view", group: "Careers" },
  { name: "applications:update", label: "Update applications", description: "Change application status and notes.", module: "careers", action: "update", group: "Careers" },
  { name: "applications:delete", label: "Delete applications", description: "Delete job applications.", module: "careers", action: "delete", group: "Careers" },

  // ---- Subscribers ----
  { name: "subscribers:view", label: "View subscribers", description: "See newsletter subscribers.", module: "subscribers", action: "view", group: "Subscribers" },
  { name: "subscribers:delete", label: "Delete subscribers", description: "Delete newsletter subscribers.", module: "subscribers", action: "delete", group: "Subscribers" },

  // ---- Media ----
  { name: "media:view", label: "View media library", description: "Browse uploaded media.", module: "media", action: "view", group: "Media" },
  { name: "media:upload", label: "Upload media", description: "Upload new media files.", module: "media", action: "upload", group: "Media" },
  { name: "media:delete", label: "Delete media", description: "Delete media files.", module: "media", action: "delete", group: "Media" },

  // ---- SEO / settings ----
  { name: "seo:manage", label: "Manage SEO", description: "Edit SEO settings for all pages.", module: "seo", action: "manage", group: "SEO" },
  { name: "settings:manage", label: "Manage website settings", description: "Edit company info and site-wide settings.", module: "settings", action: "manage", group: "Settings" },

  // ---- Users & roles ----
  { name: "users:manage", label: "Manage users", description: "Create, edit and delete admin users.", module: "users", action: "manage", group: "Users & Roles" },
  { name: "roles:manage", label: "Manage roles & permissions", description: "Create roles and grant permissions.", module: "roles", action: "manage", group: "Users & Roles" },

  // ---- System ----
  { name: "audit:view", label: "View activity logs", description: "See the audit trail of admin actions.", module: "audit", action: "view", group: "System" },
  { name: "system:configure", label: "System configuration", description: "Change system-level settings and clear caches.", module: "system", action: "configure", group: "System" },

  // ---- Tasks ----
  { name: "tasks:view", label: "View assigned tasks", description: "See tasks assigned to you.", module: "tasks", action: "view", group: "Tasks" },
  { name: "tasks:view_all", label: "View all tasks", description: "See every team member's tasks.", module: "tasks", action: "view_all", group: "Tasks" },
  { name: "tasks:create", label: "Create tasks", description: "Assign tasks to team members.", module: "tasks", action: "create", group: "Tasks" },
  { name: "tasks:update", label: "Update tasks", description: "Edit task details.", module: "tasks", action: "update", group: "Tasks" },
  { name: "tasks:delete", label: "Delete tasks", description: "Delete tasks.", module: "tasks", action: "delete", group: "Tasks" },
  { name: "tasks:submit", label: "Submit tasks", description: "Submit completed work for review.", module: "tasks", action: "submit", group: "Tasks" },
  { name: "tasks:verify", label: "Verify tasks", description: "Approve or reject submissions and award points.", module: "tasks", action: "verify", group: "Tasks" },

  // ---- Attendance ----
  { name: "attendance:view", label: "View my attendance", description: "See your own attendance records.", module: "attendance", action: "view", group: "Attendance" },
  { name: "attendance:view_all", label: "View team attendance", description: "See everyone's attendance.", module: "attendance", action: "view_all", group: "Attendance" },

  // ---- Payroll ----
  { name: "payroll:view", label: "View points & payroll", description: "See monthly points, tasks and attendance summary.", module: "payroll", action: "view", group: "Payroll" },

  // ---- Payments ----
  { name: "payments:view", label: "View payments", description: "See the payment requests list and stats.", module: "payments", action: "view", group: "Payments" },
  { name: "payments:view_details", label: "View payment details", description: "Open payment details, timeline and Razorpay link.", module: "payments", action: "view_details", group: "Payments" },
  { name: "payments:create", label: "Create payment requests", description: "Create payment requests against leads.", module: "payments", action: "create", group: "Payments" },
  { name: "payments:link_create", label: "Generate payment links", description: "Generate Razorpay payment links for approved requests.", module: "payments", action: "link_create", group: "Payments" },
  { name: "payments:send_whatsapp", label: "Send via WhatsApp", description: "Send the payment link to the client on WhatsApp.", module: "payments", action: "send_whatsapp", group: "Payments" },
  { name: "payments:resend_whatsapp", label: "Resend via WhatsApp", description: "Resend the payment link to the client on WhatsApp.", module: "payments", action: "resend_whatsapp", group: "Payments" },
  { name: "payments:cancel", label: "Cancel payment requests", description: "Cancel payment requests before they are paid.", module: "payments", action: "cancel", group: "Payments" },
];

export const PERMISSIONS = PERMISSION_CATALOG.map((p) => p.name);

export type PermissionName = (typeof PERMISSIONS)[number];
