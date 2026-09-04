import { Router, type NextFunction, type Request, type Response } from "express";
import type { ZodTypeAny } from "zod";
import { authenticate, requirePermission } from "../middleware/auth";
import { uploadFile, multerErrorHandler } from "../middleware/upload";
import { validate } from "../utils/asyncHandler";
import {
  contactStatusSchema, estimateStatusSchema, replySchema, serviceSchema, portfolioSchema, teamMemberSchema, testimonialSchema, faqSchema, seoSettingSchema,
  blogSchema, jobSchema, jobApplicationStatusSchema, leadSchema, leadUpdateSchema, leadStatusSchema, leadNoteSchema, leadTransferSchema, leadTimelineSchema,
  notificationMarkSchema, roleSchema,
} from "../schemas";
import {
  listContacts, getContact, updateContact, replyToContact, deleteContact, listAdminUsers,
} from "../controllers/contactController";
import { listSubscribers, deleteSubscriber } from "../controllers/newsletterController";
import { listEstimates, updateEstimate, deleteEstimate } from "../controllers/estimatorController";
import {
  listEntity, getEntity, createEntity, updateEntity, deleteEntity,
  getSettings, updateSettings, deleteSetting,
  listSeoSettings, upsertSeoSetting,
  dashboardStats, activityLogs, clearCache,
} from "../controllers/adminController";
import {
  listAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog,
} from "../controllers/blogController";
import {
  listAllJobs, getJobById, createJob, updateJob, deleteJob,
  listApplications, getApplication, updateApplication, deleteApplication,
} from "../controllers/careerController";
import {
  listLeads, getLead, createLead, updateLead, deleteLead,
  updateLeadStatus, addLeadNote, deleteLeadNote, assignLead,
  findDuplicates, mergeLeads, addTimelineEntry, kanbanBoard, leadStats, importLeadsFile,
} from "../controllers/leadController";
import {
  listNotifications, markNotificationRead, markAllRead, deleteNotification,
} from "../controllers/notificationController";
import {
  listRoles, getRole, createRole, updateRole, deleteRole, listPermissions, upsertPermission,
} from "../controllers/roleController";

const router = Router();

// ---- dashboard & system ----
router.get("/dashboard", authenticate, requirePermission("dashboard:view"), dashboardStats);
router.get("/activity", authenticate, requirePermission("audit:view"), activityLogs);
router.post("/clear-cache", authenticate, requirePermission("system:configure"), clearCache);

// ---- content CRUD (generic) ----
const entities = ["service", "portfolio", "team", "testimonial", "faq"];
const entitySchemas: Record<string, ZodTypeAny> = {
  service: serviceSchema,
  portfolio: portfolioSchema,
  team: teamMemberSchema,
  testimonial: testimonialSchema,
  faq: faqSchema,
};

/** Maps the route entity to its granular permission module prefix. */
const ENTITY_PERM: Record<string, { view: string; create: string; update: string; delete: string }> = {
  service: { view: "services:view", create: "services:create", update: "services:update", delete: "services:delete" },
  portfolio: { view: "portfolio:view", create: "portfolio:create", update: "portfolio:update", delete: "portfolio:delete" },
  team: { view: "team:view", create: "team:create", update: "team:update", delete: "team:delete" },
  testimonial: { view: "testimonials:view", create: "testimonials:create", update: "testimonials:update", delete: "testimonials:delete" },
  faq: { view: "faqs:view", create: "faqs:create", update: "faqs:update", delete: "faqs:delete" },
};

function withEntity(entity: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.params.entity = entity;
    next();
  };
}

for (const entity of entities) {
  const p = ENTITY_PERM[entity];
  router.get(`/${entity}`, withEntity(entity), authenticate, requirePermission(p.view), listEntity);
  router.get(`/${entity}/:id`, withEntity(entity), authenticate, requirePermission(p.view), getEntity);
  router.post(`/${entity}`, withEntity(entity), authenticate, requirePermission(p.create), validate(entitySchemas[entity]), createEntity);
  router.put(`/${entity}/:id`, withEntity(entity), authenticate, requirePermission(p.update), validate(entitySchemas[entity]), updateEntity);
  router.delete(`/${entity}/:id`, withEntity(entity), authenticate, requirePermission(p.delete), deleteEntity);
}

// ---- blogs ----
router.get("/blogs", authenticate, requirePermission("blogs:view"), listAllBlogs);
router.get("/blogs/:id", authenticate, requirePermission("blogs:view"), getBlogById);
router.post("/blogs", authenticate, requirePermission("blogs:create"), validate(blogSchema), createBlog);
router.put("/blogs/:id", authenticate, requirePermission("blogs:update"), validate(blogSchema), updateBlog);
router.delete("/blogs/:id", authenticate, requirePermission("blogs:delete"), deleteBlog);

// ---- careers: jobs ----
router.get("/careers", authenticate, requirePermission("careers:view"), listAllJobs);
router.get("/careers/jobs/:id", authenticate, requirePermission("careers:view"), getJobById);
router.post("/careers/jobs", authenticate, requirePermission("careers:create"), validate(jobSchema), createJob);
router.put("/careers/jobs/:id", authenticate, requirePermission("careers:update"), validate(jobSchema), updateJob);
router.delete("/careers/jobs/:id", authenticate, requirePermission("careers:delete"), deleteJob);

// ---- careers: applications ----
router.get("/careers/applications", authenticate, requirePermission("applications:view"), listApplications);
router.get("/careers/applications/:id", authenticate, requirePermission("applications:view"), getApplication);
router.patch("/careers/applications/:id", authenticate, requirePermission("applications:update"), validate(jobApplicationStatusSchema), updateApplication);
router.delete("/careers/applications/:id", authenticate, requirePermission("applications:delete"), deleteApplication);

// ---- leads (CRM) ----
router.get("/leads", authenticate, requirePermission("leads:view"), listLeads);
router.get("/leads/kanban", authenticate, requirePermission("leads:view"), kanbanBoard);
router.get("/leads/stats", authenticate, requirePermission("leads:view"), leadStats);
router.get("/leads/duplicates", authenticate, requirePermission("leads:view"), findDuplicates);
router.post("/leads/merge", authenticate, requirePermission("leads:update"), mergeLeads);
router.post("/leads/import", authenticate, requirePermission("leads:create"), uploadFile("imports", { fieldName: "file", maxSizeMb: 10, allowed: ["spreadsheet"] }), multerErrorHandler, importLeadsFile);
router.get("/leads/:id", authenticate, requirePermission("leads:view"), getLead);
router.post("/leads", authenticate, requirePermission("leads:create"), validate(leadSchema), createLead);
router.put("/leads/:id", authenticate, requirePermission("leads:update"), validate(leadUpdateSchema), updateLead);
router.patch("/leads/:id", authenticate, requirePermission("leads:update"), validate(leadUpdateSchema), updateLead);
router.delete("/leads/:id", authenticate, requirePermission("leads:delete"), deleteLead);
router.patch("/leads/:id/status", authenticate, requirePermission("leads:update"), validate(leadStatusSchema), updateLeadStatus);
router.patch("/leads/:id/assign", authenticate, requirePermission("leads:assign"), validate(leadTransferSchema), assignLead);
router.post("/leads/:id/notes", authenticate, requirePermission("leads:update"), validate(leadNoteSchema), addLeadNote);
router.delete("/leads/:id/notes/:noteId", authenticate, requirePermission("leads:update"), deleteLeadNote);
router.post("/leads/:id/timeline", authenticate, requirePermission("leads:update"), validate(leadTimelineSchema), addTimelineEntry);

// ---- contacts ---- (specific routes must be registered before :id routes)
router.get("/contacts", authenticate, requirePermission("contacts:view"), listContacts);
router.get("/contacts/admin-users", authenticate, requirePermission("contacts:view"), listAdminUsers);
router.get("/contacts/:id", authenticate, requirePermission("contacts:view"), getContact);
router.patch("/contacts/:id", authenticate, requirePermission("contacts:update"), validate(contactStatusSchema), updateContact);
router.post("/contacts/:id/reply", authenticate, requirePermission("contacts:reply"), validate(replySchema), replyToContact);
router.delete("/contacts/:id", authenticate, requirePermission("contacts:delete"), deleteContact);

// ---- subscribers ----
router.get("/subscribers", authenticate, requirePermission("subscribers:view"), listSubscribers);
router.delete("/subscribers/:id", authenticate, requirePermission("subscribers:delete"), deleteSubscriber);

// ---- estimates ----
router.get("/estimates", authenticate, requirePermission("estimates:view"), listEstimates);
router.patch("/estimates/:id", authenticate, requirePermission("estimates:update"), validate(estimateStatusSchema), updateEstimate);
router.delete("/estimates/:id", authenticate, requirePermission("estimates:delete"), deleteEstimate);

// ---- notifications ----
router.get("/notifications", authenticate, requirePermission("dashboard:view"), listNotifications);
router.patch("/notifications/:id", authenticate, requirePermission("dashboard:view"), validate(notificationMarkSchema), markNotificationRead);
router.post("/notifications/read-all", authenticate, requirePermission("dashboard:view"), markAllRead);
router.delete("/notifications/:id", authenticate, requirePermission("dashboard:view"), deleteNotification);

// ---- roles & permissions ----
router.get("/roles", authenticate, requirePermission("roles:manage"), listRoles);
router.get("/roles/:id", authenticate, requirePermission("roles:manage"), getRole);
router.post("/roles", authenticate, requirePermission("roles:manage"), validate(roleSchema), createRole);
router.put("/roles/:id", authenticate, requirePermission("roles:manage"), validate(roleSchema), updateRole);
router.delete("/roles/:id", authenticate, requirePermission("roles:manage"), deleteRole);
router.get("/permissions", authenticate, requirePermission("roles:manage"), listPermissions);
router.post("/permissions", authenticate, requirePermission("roles:manage"), upsertPermission);

// ---- settings (CMS) & SEO ----
router.get("/settings", authenticate, requirePermission("settings:manage"), getSettings);
router.put("/settings", authenticate, requirePermission("settings:manage"), updateSettings);
router.delete("/settings/:group/:key", authenticate, requirePermission("settings:manage"), deleteSetting);

router.get("/seo", authenticate, requirePermission("seo:manage"), listSeoSettings);
router.put("/seo", authenticate, requirePermission("seo:manage"), validate(seoSettingSchema), upsertSeoSetting);

export default router;
