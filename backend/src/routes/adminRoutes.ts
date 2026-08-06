import { Router, type NextFunction, type Request, type Response } from "express";
import type { ZodTypeAny } from "zod";
import { authenticate, isStaffOrAbove, isManagerOrAbove, isAdminOrAbove } from "../middleware/auth";
import { uploadFile, multerErrorHandler } from "../middleware/upload";
import { validate } from "../utils/asyncHandler";
import {
  contactStatusSchema, estimateStatusSchema, replySchema, serviceSchema, portfolioSchema, teamMemberSchema, testimonialSchema, faqSchema, seoSettingSchema,
  blogSchema, jobSchema, jobApplicationStatusSchema, leadSchema, leadStatusSchema, leadNoteSchema, leadTransferSchema, leadTimelineSchema,
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
router.get("/dashboard", authenticate, isStaffOrAbove, dashboardStats);
router.get("/activity", authenticate, isStaffOrAbove, activityLogs);
router.post("/clear-cache", authenticate, isManagerOrAbove, clearCache);

// ---- content CRUD (generic) ----
const entities = ["service", "portfolio", "team", "testimonial", "faq"];
const entitySchemas: Record<string, ZodTypeAny> = {
  service: serviceSchema,
  portfolio: portfolioSchema,
  team: teamMemberSchema,
  testimonial: testimonialSchema,
  faq: faqSchema,
};

function withEntity(entity: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.params.entity = entity;
    next();
  };
}

for (const entity of entities) {
  router.get(`/${entity}`, withEntity(entity), authenticate, isStaffOrAbove, listEntity);
  router.get(`/${entity}/:id`, withEntity(entity), authenticate, isStaffOrAbove, getEntity);
  router.post(`/${entity}`, withEntity(entity), authenticate, isManagerOrAbove, validate(entitySchemas[entity]), createEntity);
  router.put(`/${entity}/:id`, withEntity(entity), authenticate, isManagerOrAbove, validate(entitySchemas[entity]), updateEntity);
  router.delete(`/${entity}/:id`, withEntity(entity), authenticate, isManagerOrAbove, deleteEntity);
}

// ---- blogs ----
router.get("/blogs", authenticate, isStaffOrAbove, listAllBlogs);
router.get("/blogs/:id", authenticate, isStaffOrAbove, getBlogById);
router.post("/blogs", authenticate, isManagerOrAbove, validate(blogSchema), createBlog);
router.put("/blogs/:id", authenticate, isManagerOrAbove, validate(blogSchema), updateBlog);
router.delete("/blogs/:id", authenticate, isManagerOrAbove, deleteBlog);

// ---- careers: jobs ----
router.get("/careers", authenticate, isStaffOrAbove, listAllJobs);
router.get("/careers/jobs/:id", authenticate, isStaffOrAbove, getJobById);
router.post("/careers/jobs", authenticate, isManagerOrAbove, validate(jobSchema), createJob);
router.put("/careers/jobs/:id", authenticate, isManagerOrAbove, validate(jobSchema), updateJob);
router.delete("/careers/jobs/:id", authenticate, isManagerOrAbove, deleteJob);

// ---- careers: applications ----
router.get("/careers/applications", authenticate, isStaffOrAbove, listApplications);
router.get("/careers/applications/:id", authenticate, isStaffOrAbove, getApplication);
router.patch("/careers/applications/:id", authenticate, isStaffOrAbove, validate(jobApplicationStatusSchema), updateApplication);
router.delete("/careers/applications/:id", authenticate, isManagerOrAbove, deleteApplication);

// ---- leads (CRM) ----
router.get("/leads", authenticate, isStaffOrAbove, listLeads);
router.get("/leads/kanban", authenticate, isStaffOrAbove, kanbanBoard);
router.get("/leads/stats", authenticate, isStaffOrAbove, leadStats);
router.get("/leads/duplicates", authenticate, isStaffOrAbove, findDuplicates);
router.post("/leads/merge", authenticate, isManagerOrAbove, mergeLeads);
router.post("/leads/import", authenticate, isManagerOrAbove, uploadFile("imports", { fieldName: "file", maxSizeMb: 10, allowed: ["spreadsheet"] }), multerErrorHandler, importLeadsFile);
router.get("/leads/:id", authenticate, isStaffOrAbove, getLead);
router.post("/leads", authenticate, isManagerOrAbove, validate(leadSchema), createLead);
router.put("/leads/:id", authenticate, isManagerOrAbove, validate(leadSchema), updateLead);
router.delete("/leads/:id", authenticate, isManagerOrAbove, deleteLead);
router.patch("/leads/:id/status", authenticate, isStaffOrAbove, validate(leadStatusSchema), updateLeadStatus);
router.patch("/leads/:id/assign", authenticate, isStaffOrAbove, validate(leadTransferSchema), assignLead);
router.post("/leads/:id/notes", authenticate, isStaffOrAbove, validate(leadNoteSchema), addLeadNote);
router.delete("/leads/:id/notes/:noteId", authenticate, isManagerOrAbove, deleteLeadNote);
router.post("/leads/:id/timeline", authenticate, isStaffOrAbove, validate(leadTimelineSchema), addTimelineEntry);

// ---- contacts ---- (specific routes must be registered before :id routes)
router.get("/contacts", authenticate, isStaffOrAbove, listContacts);
router.get("/contacts/admin-users", authenticate, isStaffOrAbove, listAdminUsers);
router.get("/contacts/:id", authenticate, isStaffOrAbove, getContact);
router.patch("/contacts/:id", authenticate, isStaffOrAbove, validate(contactStatusSchema), updateContact);
router.post("/contacts/:id/reply", authenticate, isStaffOrAbove, validate(replySchema), replyToContact);
router.delete("/contacts/:id", authenticate, isManagerOrAbove, deleteContact);

// ---- subscribers ----
router.get("/subscribers", authenticate, isStaffOrAbove, listSubscribers);
router.delete("/subscribers/:id", authenticate, isManagerOrAbove, deleteSubscriber);

// ---- estimates ----
router.get("/estimates", authenticate, isStaffOrAbove, listEstimates);
router.patch("/estimates/:id", authenticate, isStaffOrAbove, validate(estimateStatusSchema), updateEstimate);
router.delete("/estimates/:id", authenticate, isManagerOrAbove, deleteEstimate);

// ---- notifications ----
router.get("/notifications", authenticate, isStaffOrAbove, listNotifications);
router.patch("/notifications/:id", authenticate, isStaffOrAbove, validate(notificationMarkSchema), markNotificationRead);
router.post("/notifications/read-all", authenticate, isStaffOrAbove, markAllRead);
router.delete("/notifications/:id", authenticate, isStaffOrAbove, deleteNotification);

// ---- roles & permissions ----
router.get("/roles", authenticate, isStaffOrAbove, listRoles);
router.get("/roles/:id", authenticate, isStaffOrAbove, getRole);
router.post("/roles", authenticate, isAdminOrAbove, validate(roleSchema), createRole);
router.put("/roles/:id", authenticate, isAdminOrAbove, validate(roleSchema), updateRole);
router.delete("/roles/:id", authenticate, isAdminOrAbove, deleteRole);
router.get("/permissions", authenticate, isStaffOrAbove, listPermissions);
router.post("/permissions", authenticate, isAdminOrAbove, upsertPermission);

// ---- settings (CMS) & SEO ----
router.get("/settings", authenticate, isStaffOrAbove, getSettings);
router.put("/settings", authenticate, isManagerOrAbove, updateSettings);
router.delete("/settings/:group/:key", authenticate, isAdminOrAbove, deleteSetting);

router.get("/seo", authenticate, isStaffOrAbove, listSeoSettings);
router.put("/seo", authenticate, isManagerOrAbove, validate(seoSettingSchema), upsertSeoSetting);

export default router;
