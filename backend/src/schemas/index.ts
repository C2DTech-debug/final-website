import { z } from "zod";
import { ROLES } from "../types";

export const emailSchema = z.string().email().max(200).transform((v) => v.toLowerCase());

const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(120);

export const recaptchaSchema = z.string().max(2048).optional().default("");

// ---------- Public ----------

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z.string().trim().max(30).optional().default(""),
  service: z.string().trim().max(120).optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
  timeline: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  recaptchaToken: recaptchaSchema,
});

export const newsletterSchema = z.object({
  email: emailSchema,
  name: z.string().trim().max(120).optional().default(""),
  source: z.string().trim().max(50).optional().default("footer"),
  recaptchaToken: recaptchaSchema,
});

export const estimateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z.string().trim().max(30).optional().default(""),
  services: z.array(z.string().max(80)).min(1, "Select at least one service"),
  addons: z.array(z.string().max(120)).optional().default([]),
  notes: z.string().trim().max(2000).optional().default(""),
  recaptchaToken: recaptchaSchema,
});

// ---------- Auth ----------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(200),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(200),
});

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: z.string().min(8).max(200),
  role: z.enum(ROLES),
  phone: z.string().max(30).optional().default(""),
  isActive: z.boolean().optional().default(true),
});

export const updateAdminUserSchema = createAdminUserSchema
  .partial()
  .extend({ password: z.string().min(8).max(200).optional() });

// ---------- Admin CRUD ----------

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and dashes");

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  tagline: z.string().max(300).optional().default(""),
  icon: z.string().max(300).optional().default(""),
  image: z.string().max(500).optional().default(""),
  shortDescription: z.string().max(600).optional().default(""),
  description: z.string().max(20000).optional().default(""),
  features: z.array(z.string().max(300)).optional().default([]),
  deliverables: z.array(z.string().max(300)).optional().default([]),
  pricing: z
    .object({
      enabled: z.boolean().optional().default(true),
      startingAt: z.number().min(0).optional().default(0),
      currency: z.string().max(10).optional().default("INR"),
      priceLabel: z.string().max(60).optional().default(""),
      deliveryDays: z.number().min(0).optional().default(0),
    })
    .optional(),
  category: z.string().max(80).optional().default("general"),
  order: z.number().int().optional().default(0),
  published: z.boolean().optional().default(true),
  seo: z
    .object({
      title: z.string().max(200).optional().default(""),
      description: z.string().max(400).optional().default(""),
      keywords: z.string().max(400).optional().default(""),
    })
    .optional(),
});

export const portfolioSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: slugSchema,
  shortDescription: z.string().max(600).optional().default(""),
  description: z.string().max(20000).optional().default(""),
  coverImage: z.string().max(600).optional().default(""),
  gallery: z.array(z.string().max(600)).optional().default([]),
  liveUrl: z.string().max(600).optional().default(""),
  githubUrl: z.string().max(600).optional().default(""),
  technologies: z.array(z.string().max(100)).optional().default([]),
  category: z.string().max(120).optional().default("Web Development"),
  client: z.string().max(200).optional().default(""),
  year: z.string().max(20).optional().default(""),
  role: z.string().max(200).optional().default(""),
  featured: z.boolean().optional().default(false),
  status: z.enum(["draft", "published", "hidden"]).optional().default("published"),
  tags: z.array(z.string().max(100)).optional().default([]),
  order: z.number().int().optional().default(0),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  position: z.string().trim().min(2).max(120),
  bio: z.string().max(5000).optional().default(""),
  skills: z.array(z.string().max(100)).optional().default([]),
  photo: z.string().max(600).optional().default(""),
  socialLinks: z
    .object({
      github: z.string().max(600).optional().default(""),
      linkedin: z.string().max(600).optional().default(""),
      twitter: z.string().max(600).optional().default(""),
      website: z.string().max(600).optional().default(""),
    })
    .optional(),
  email: z.string().max(200).optional().default(""),
  order: z.number().int().optional().default(0),
  published: z.boolean().optional().default(true),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().max(120).optional().default(""),
  company: z.string().max(120).optional().default(""),
  content: z.string().trim().min(5).max(2000),
  rating: z.number().int().min(1).max(5).optional().default(5),
  avatar: z.string().max(600).optional().default(""),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const faqSchema = z.object({
  question: z.string().trim().min(3).max(500),
  answer: z.string().trim().min(3).max(5000),
  category: z.string().max(80).optional().default("general"),
  order: z.number().int().optional().default(0),
  published: z.boolean().optional().default(true),
});

export const seoSettingSchema = z.object({
  page: z.string().max(120),
  title: z.string().max(200).optional().default(""),
  description: z.string().max(400).optional().default(""),
  keywords: z.string().max(500).optional().default(""),
  ogTitle: z.string().max(200).optional().default(""),
  ogDescription: z.string().max(400).optional().default(""),
  ogImage: z.string().max(600).optional().default(""),
  ogType: z.string().max(50).optional().default("website"),
  twitterTitle: z.string().max(200).optional().default(""),
  twitterDescription: z.string().max(400).optional().default(""),
  twitterImage: z.string().max(600).optional().default(""),
  twitterCard: z.string().max(50).optional().default("summary_large_image"),
  canonical: z.string().max(600).optional().default(""),
  noindex: z.boolean().optional().default(false),
});

export const settingValueSchema = z.object({
  group: z.string().max(60),
  key: z.string().max(120),
  label: z.string().max(200).optional().default(""),
  type: z.string().max(30).optional().default("text"),
  value: z.unknown().optional(),
});

export const idParamSchema = z.object({ id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id") });

export const contactStatusSchema = z.object({
  status: z.enum(["new", "contacted", "in_progress", "quoted", "won", "lost"]),
  assignedTo: z.string().regex(/^[a-fA-F0-9]{24}$/).optional().or(z.literal("")),
});

export const estimateStatusSchema = z.object({
  status: z.enum(["new", "contacted", "quoted", "won", "lost"]),
  assignedTo: z.string().regex(/^[a-fA-F0-9]{24}$/).optional().or(z.literal("")),
});

export const replySchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

// ---------- Blog CMS ----------

export const blogSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: slugSchema,
  excerpt: z.string().max(600).optional().default(""),
  content: z.string().max(200000).optional().default(""),
  coverImage: z.string().max(600).optional().default(""),
  category: z.string().max(120).optional().default("General"),
  tags: z.array(z.string().max(80)).optional().default([]),
  author: z.string().regex(/^[a-fA-F0-9]{24}$/).optional().or(z.literal("")),
  authorName: z.string().max(120).optional().default("Team C2D Tech"),
  status: z.enum(["draft", "published", "scheduled"]).optional().default("draft"),
  scheduledAt: z.string().datetime().nullable().optional().or(z.literal("")),
  featured: z.boolean().optional().default(false),
  readingTime: z.number().int().min(0).optional().default(0),
  seo: z
    .object({
      title: z.string().max(200).optional().default(""),
      description: z.string().max(400).optional().default(""),
      keywords: z.string().max(400).optional().default(""),
      ogImage: z.string().max(600).optional().default(""),
      noindex: z.boolean().optional().default(false),
    })
    .optional(),
});

// ---------- Careers ----------

export const jobSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: slugSchema,
  department: z.string().max(120).optional().default("Engineering"),
  location: z.string().max(200).optional().default(""),
  type: z.enum(["full_time", "part_time", "contract", "internship", "remote"]).optional().default("full_time"),
  experience: z.string().max(120).optional().default(""),
  salary: z.string().max(120).optional().default(""),
  description: z.string().max(20000).optional().default(""),
  responsibilities: z.array(z.string().max(600)).optional().default([]),
  requirements: z.array(z.string().max(600)).optional().default([]),
  benefits: z.array(z.string().max(600)).optional().default([]),
  status: z.enum(["draft", "open", "closed"]).optional().default("open"),
  featured: z.boolean().optional().default(false),
  order: z.number().int().optional().default(0),
  applicationEmail: z.string().email().max(200).optional().or(z.literal("")).optional().default(""),
  seo: z
    .object({
      title: z.string().max(200).optional().default(""),
      description: z.string().max(400).optional().default(""),
    })
    .optional(),
});

export const jobApplicationSchema = z.object({
  job: z.string().regex(/^[a-fA-F0-9]{24}$/),
  name: nameSchema,
  email: emailSchema,
  phone: z.string().max(30).optional().default(""),
  resumeUrl: z.string().max(600).optional().default(""),
  resumeName: z.string().max(200).optional().default(""),
  coverLetter: z.string().max(5000).optional().default(""),
  linkedin: z.string().max(600).optional().default(""),
  portfolio: z.string().max(600).optional().default(""),
  expectedSalary: z.string().max(80).optional().default(""),
  recaptchaToken: recaptchaSchema,
});

export const jobApplicationStatusSchema = z.object({
  status: z.enum(["new", "under_review", "interview", "offered", "hired", "rejected"]),
  notes: z.string().max(2000).optional().default(""),
});

// ---------- Lead CRM ----------

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().max(200).optional().default(""),
  email: emailSchema.optional().or(z.literal("").optional().default("")),
  phone: z.string().max(30).optional().default(""),
  whatsapp: z.string().max(30).optional().default(""),
  address: z.string().max(300).optional().default(""),
  city: z.string().max(100).optional().default(""),
  state: z.string().max(100).optional().default(""),
  country: z.string().max(100).optional().default("India"),
  businessType: z.string().max(120).optional().default(""),
  website: z.string().max(600).optional().default(""),
  service: z.string().max(120).optional().default(""),
  budget: z.string().max(80).optional().default(""),
  currency: z.string().max(10).optional().default("INR"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  source: z.enum(["contact_form", "estimator", "manual", "import", "website_chat", "whatsapp", "phone_call", "email", "facebook_ads", "google_ads", "referral", "walk_in", "api"]).optional().default("manual"),
  assignedTo: z.string().regex(/^[a-fA-F0-9]{24}$/).optional().or(z.literal("")),
  status: z.enum(["new", "contacted", "qualified", "proposal_sent", "negotiation", "follow_up", "won", "lost", "on_hold"]).optional().default("new"),
  expectedClosingDate: z.string().datetime().nullable().optional().or(z.literal("")),
  followUpDate: z.string().datetime().nullable().optional().or(z.literal("")),
  lastContactedAt: z.string().datetime().nullable().optional().or(z.literal("")),
  tags: z.array(z.string().max(60)).optional().default([]),
});

export const leadStatusSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "proposal_sent", "negotiation", "follow_up", "won", "lost", "on_hold"]),
});

export const leadNoteSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export const leadTransferSchema = z.object({
  assignedTo: z.string().regex(/^[a-fA-F0-9]{24}$/),
  note: z.string().max(1000).optional().default(""),
});

export const leadTimelineSchema = z.object({
  action: z.string().max(120),
  description: z.string().max(500).optional().default(""),
});

// ---------- Notifications ----------

export const notificationMarkSchema = z.object({
  read: z.boolean().optional().default(true),
});

// ---------- Roles & Permissions ----------

export const roleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  label: z.string().trim().min(2).max(120),
  description: z.string().max(500).optional().default(""),
  level: z.number().int().min(0).max(10).optional().default(1),
  permissions: z.array(z.string().max(120)).optional().default([]),
  system: z.boolean().optional().default(false),
});
