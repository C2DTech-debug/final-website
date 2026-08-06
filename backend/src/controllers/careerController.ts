import { Request, Response } from "express";
import { JobModel } from "../models/Job";
import { JobApplicationModel } from "../models/JobApplication";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";
import { notify } from "../services/notificationService";
import { verifyRecaptcha } from "../middleware/security";
import { sendMail } from "../services/emailService";
import { storeFile } from "../services/storageService";
import { env } from "../config/env";

// ---------- Jobs (admin) ----------

export const listAllJobs = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const data = (await JobModel.find(filter).sort({ featured: -1, order: 1, createdAt: -1 }).lean()) as unknown as Record<string, unknown>[];
  res.status(200).json({ success: true, data });
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const doc = await JobModel.findById(req.params.id).lean();
  if (!doc) throw ApiError.notFound("Job not found");
  res.status(200).json({ success: true, data: doc });
});

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const doc = await JobModel.create(req.body);
  await logActivity({ user: req.user, action: "create", entity: "career", entityId: doc._id, description: `Created job "${doc.title}"`, req });
  res.status(201).json({ success: true, data: doc });
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const doc = await JobModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) throw ApiError.notFound("Job not found");
  await logActivity({ user: req.user, action: "update", entity: "career", entityId: req.params.id, description: `Updated job "${doc.title}"`, req });
  res.status(200).json({ success: true, data: doc });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const doc = await JobModel.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("Job not found");
  await JobApplicationModel.deleteMany({ job: doc._id });
  await logActivity({ user: req.user, action: "delete", entity: "career", entityId: req.params.id, description: `Deleted job "${doc.title}"`, req });
  res.status(200).json({ success: true, data: { message: "Job deleted" } });
});

// ---------- Applications (admin) ----------

export const listApplications = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { job, status, q } = req.query;
  const filter: Record<string, unknown> = {};
  if (job) filter.job = job;
  if (status) filter.status = status;
  if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];

  const total = await JobApplicationModel.countDocuments(filter);
  const data = (await JobApplicationModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("job", "title slug department")
    .lean()) as unknown as Record<string, unknown>[];

  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getApplication = asyncHandler(async (req: Request, res: Response) => {
  const doc = await JobApplicationModel.findById(req.params.id).populate("job", "title slug department").lean();
  if (!doc) throw ApiError.notFound("Application not found");
  res.status(200).json({ success: true, data: doc });
});

export const updateApplication = asyncHandler(async (req: Request, res: Response) => {
  const doc = await JobApplicationModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Application not found");
  if (req.body.status) doc.status = req.body.status;
  if (req.body.notes !== undefined) doc.notes = req.body.notes;
  await doc.save();
  await logActivity({ user: req.user, action: "update", entity: "job_application", entityId: req.params.id, description: `Updated application status for ${doc.name}`, req });
  res.status(200).json({ success: true, data: doc });
});

export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
  const doc = await JobApplicationModel.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("Application not found");
  await logActivity({ user: req.user, action: "delete", entity: "job_application", entityId: req.params.id, description: `Deleted application from ${doc.name}`, req });
  res.status(200).json({ success: true, data: { message: "Application deleted" } });
});

// ---------- Public ----------

export const listOpenJobs = asyncHandler(async (_req: Request, res: Response) => {
  const data = (await JobModel.find({ status: "open" }).sort({ featured: -1, order: 1, createdAt: -1 }).lean()) as unknown as Record<string, unknown>[];
  const departments = await JobModel.distinct("department", { status: "open" });
  res.status(200).json({ success: true, data, meta: { departments } });
});

export const getOpenJob = asyncHandler(async (req: Request, res: Response) => {
  const doc = (await JobModel.findOne({ slug: req.params.slug, status: "open" }).lean()) as unknown as
    | (Record<string, unknown> & { _id: unknown; title: string; status: string })
    | null;
  if (!doc) throw ApiError.notFound("Job opening not found");
  res.status(200).json({ success: true, data: doc });
});

export const applyToJob = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const recaptchaOk = await verifyRecaptcha(body.recaptchaToken || "");
  if (!recaptchaOk) throw ApiError.badRequest("reCAPTCHA verification failed");

  const job = (await JobModel.findById(body.job).lean()) as unknown as { _id: unknown; title: string; status: string } | null;
  if (!job || job.status !== "open") throw ApiError.badRequest("This position is no longer accepting applications");

  const file = (req as Request & { file?: Express.Multer.File }).file;
  let resumeUrl = body.resumeUrl || "";
  let resumeName = body.resumeName || "";
  if (file) {
    const stored = await storeFile(file, "resumes");
    resumeUrl = stored.url;
    resumeName = file.originalname;
  }
  const app = await JobApplicationModel.create({
    job: body.job,
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    resumeUrl,
    resumeName,
    coverLetter: body.coverLetter || "",
    linkedin: body.linkedin || "",
    portfolio: body.portfolio || "",
    expectedSalary: body.expectedSalary || "",
    ip: req.ip || "",
  });

  void sendMail({
    to: body.email,
    subject: `Application received — ${job.title} @ C2D Tech`,
    html: `<div style="font-family:sans-serif;color:#111827;line-height:1.6"><h3>Hi ${body.name},</h3><p>We received your application for <strong>${job.title}</strong> at C2D Tech (Concept to Deploy).</p><p>Our friends squad will review your profile and get back to you within a few working days.</p><p>— Team C2D Tech</p></div>`,
  });
  if (env.SMTP.ADMIN_TO) {
    void sendMail({
      to: env.SMTP.ADMIN_TO,
      subject: `New job application: ${job.title} — ${body.name}`,
      html: `<div style="font-family:sans-serif;color:#111827;line-height:1.6"><h3>New application</h3><p><strong>Position:</strong> ${job.title}<br/><strong>Candidate:</strong> ${body.name}<br/><strong>Email:</strong> ${body.email}<br/><strong>Phone:</strong> ${body.phone || "—"}</p></div>`,
    });
  }

  await notify({
    type: "career",
    title: `New application for ${job.title}`,
    message: `${body.name} applied for ${job.title}`,
    link: "/admin/careers",
    entityType: "job_application",
  });

  await logActivity({ action: "create", entity: "job_application", entityId: app._id, description: `${body.name} applied for "${job.title}"`, req });
  res.status(201).json({ success: true, data: { id: app._id, message: "Application submitted. We will get back to you soon." } });
});
