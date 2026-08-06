// ---------- Shared API envelope ----------
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number; unread?: number };
}

// ---------- Roles ----------
export const ROLES = [
  "super_admin",
  "admin",
  "project_manager",
  "marketing_manager",
  "content_editor",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  project_manager: "Project Manager",
  marketing_manager: "Marketing Manager",
  content_editor: "Content Editor",
};

export const ROLE_LEVEL: Record<Role, number> = {
  super_admin: 5,
  admin: 4,
  project_manager: 3,
  marketing_manager: 2,
  content_editor: 1,
};

export const PORTFOLIO_STATUS = ["draft", "published", "hidden"] as const;
export const LEAD_STATUS = ["new", "contacted", "qualified", "proposal_sent", "negotiation", "follow_up", "won", "lost", "on_hold"] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number];
export const ESTIMATE_STATUS = ["new", "contacted", "quoted", "won", "lost"] as const;
export type EstimateStatus = (typeof ESTIMATE_STATUS)[number];

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  follow_up: "Follow Up",
  won: "Won",
  lost: "Lost",
  on_hold: "On Hold",
};

export const LEAD_PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  contact_form: "Contact Form",
  estimator: "Estimator",
  manual: "Manual",
  import: "Import",
  website_chat: "Website Chat",
  whatsapp: "WhatsApp",
  phone_call: "Phone Call",
  email: "Email",
  facebook_ads: "Facebook Ads",
  google_ads: "Google Ads",
  referral: "Referral",
  walk_in: "Walk-in",
  api: "API",
};

export const JOB_TYPES = ["full_time", "part_time", "contract", "internship", "remote"] as const;
export type JobType = (typeof JOB_TYPES)[number];
export const JOB_STATUS = ["draft", "open", "closed"] as const;
export const JOB_STATUS_LABELS: Record<string, string> = { draft: "Draft", open: "Open", closed: "Closed" };
export const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};
export const APPLICATION_STATUS = ["new", "under_review", "interview", "offered", "hired", "rejected"] as const;
export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  new: "New",
  under_review: "Under Review",
  interview: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

// ---------- Admin user ----------
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

// ---------- SEO ----------
export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  canonical?: string;
  noindex?: boolean;
}

// ---------- Services ----------
export interface ServicePricing {
  enabled?: boolean;
  startingAt?: number;
  currency?: string;
  priceLabel?: string;
  deliveryDays?: number;
}

export interface Service {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  icon: string;
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  deliverables: string[];
  pricing: ServicePricing;
  category: string;
  order: number;
  published: boolean;
  seo?: SeoMeta;
  createdAt?: string;
  updatedAt?: string;
}

// ---------- Portfolio ----------
export interface PortfolioProject {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  gallery: string[];
  liveUrl: string;
  githubUrl: string;
  technologies: string[];
  category: string;
  client: string;
  year: string;
  role: string;
  featured: boolean;
  status: string;
  tags: string[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// ---------- Team ----------
export interface TeamMember {
  _id: string;
  name: string;
  position: string;
  bio: string;
  skills: string[];
  photo: string;
  socialLinks?: { github?: string; linkedin?: string; twitter?: string; website?: string };
  email: string;
  order: number;
  published: boolean;
}

// ---------- Testimonials ----------
export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  featured: boolean;
  published: boolean;
  order: number;
}

// ---------- FAQ ----------
export interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
}

// ---------- Contacts / Leads ----------
export interface ContactReply {
  body: string;
  by: string;
  byName: string;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  status: LeadStatus;
  assignedTo?: { _id: string; name: string; email: string } | string | null;
  replies: ContactReply[];
  createdAt: string;
  updatedAt: string;
}

// ---------- Estimates ----------
export interface ProjectEstimate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  serviceNames: string[];
  addons: string[];
  totalCost: number;
  currency: string;
  timeline: string;
  timelineDays: number;
  notes: string;
  status: EstimateStatus;
  assignedTo?: { _id: string; name: string; email: string } | string | null;
  createdAt: string;
}

// ---------- Newsletter ----------
export interface NewsletterSubscriber {
  _id: string;
  email: string;
  name: string;
  status: string;
  source: string;
  createdAt: string;
}

// ---------- Media ----------
export interface MediaAsset {
  _id: string;
  name: string;
  originalName: string;
  url: string;
  publicId: string;
  provider: string;
  mimeType: string;
  type: string;
  size: number;
  width: number;
  height: number;
  thumbUrl: string;
  createdAt: string;
}

// ---------- Website settings ----------
export interface SettingDoc {
  _id: string;
  group: string;
  key: string;
  label: string;
  value: unknown;
  type: string;
}

export type SettingsMap = Record<string, Record<string, SettingDoc>>;

/** Flattened public shape (values only) as served by /public endpoints. */
export type PublicSettings = Record<string, Record<string, unknown>>;

// ---------- SEO settings ----------
export interface SeoSetting {
  _id: string;
  page: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCard: string;
  canonical: string;
  noindex: boolean;
}

// ---------- Activity logs ----------
export interface ActivityLog {
  _id: string;
  user: string;
  userName: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  details: Record<string, unknown>;
  ip: string;
  createdAt: string;
}

// ---------- Analytics ----------
export interface AnalyticsOverview {
  days: number;
  totalVisits: number;
  uniqueVisits: number;
  leads: number;
  estimates: number;
  byDay: { _id: string; count: number }[];
  byDevice: Record<string, number>;
  byPage: { _id: string; count: number }[];
}

export interface DashboardStats {
  counts: { contacts: number; projects: number; estimates: number; subscribers: number; team: number; services: number };
  contactTrend: { _id: string; count: number }[];
  contactsByStatus: { _id: string; count: number }[];
  estimatesByStatus: { _id: string; count: number }[];
  servicePopularity: { _id: string; count: number }[];
  device: Record<string, number>;
  recentActivity: ActivityLog[];
}

// ---------- Estimator ----------
export interface EstimatorAddon {
  id: string;
  label: string;
  price: number;
}

export interface EstimatorConfig {
  settings: {
    basePrices?: Record<string, number>;
    addons?: EstimatorAddon[];
    timeline?: { base?: number; perService?: number };
  };
  services: Service[];
}

export interface QuoteResult {
  services: string[];
  totalCost: number;
  currency: string;
  timelineDays: number;
  timelineLabel: string;
}

// ---------- Auth ----------
export interface AuthTokens {
  accessToken: string;
  user: AdminUser;
}

export interface LoginResponse {
  accessToken?: string;
  user?: AdminUser;
  requiresTwoFactor?: boolean;
  pendingToken?: string;
}

// ---------- Home bundle ----------
export interface HomeBundle {
  settings: PublicSettings;
  services: Service[];
  portfolio: PortfolioProject[];
  team: TeamMember[];
  testimonials: Testimonial[];
  faqs: Faq[];
  seo: SeoSetting | null;
}

// ---------- Blog ----------
export const BLOG_STATUS = ["draft", "published", "scheduled"] as const;
export const BLOG_STATUS_LABELS: Record<string, string> = { draft: "Draft", published: "Published", scheduled: "Scheduled" };

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: { _id: string; name: string } | string | null;
  authorName: string;
  status: (typeof BLOG_STATUS)[number];
  scheduledAt: string | null;
  publishedAt: string | null;
  featured: boolean;
  views: number;
  readingTime: number;
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    noindex: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostResponse {
  blog: Blog;
  related: Blog[];
}

// ---------- Careers ----------
export interface Job {
  _id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: JobType;
  experience: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: (typeof JOB_STATUS)[number];
  featured: boolean;
  order: number;
  applicationEmail: string;
  seo: { title: string; description: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface JobApplication {
  _id: string;
  job: string | { _id: string; title: string; slug: string } | null;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  resumeName: string;
  coverLetter: string;
  linkedin: string;
  portfolio: string;
  expectedSalary: string;
  status: (typeof APPLICATION_STATUS)[number];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Lead CRM ----------
export interface LeadTimelineEntry {
  _id: string;
  action: string;
  description: string;
  by: string | null;
  byName: string;
  createdAt: string;
}

export interface LeadNote {
  _id: string;
  lead: string;
  body: string;
  by: string | null;
  byName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Lead {
  _id: string;
  leadId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  country: string;
  businessType: string;
  website: string;
  service: string;
  budget: string;
  currency: string;
  priority: string;
  source: string;
  assignedTo?: { _id: string; name: string; email: string } | string | null;
  createdBy?: { _id: string; name: string; email: string } | string | null;
  status: string;
  expectedClosingDate: string | null;
  followUpDate: string | null;
  lastContactedAt: string | null;
  tags: string[];
  attachments: { name: string; url: string; size: number; mime: string }[];
  timeline: LeadTimelineEntry[];
  notes?: LeadNote[];
  referrer: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KanbanColumn {
  status: string;
  leads: Lead[];
}

export interface LeadStats {
  total: number;
  byStatus: { _id: string; count: number }[];
  bySource: { _id: string; count: number }[];
  byPriority: { _id: string; count: number }[];
  upcomingFollowUps: {
    _id: string;
    leadId: string;
    name: string;
    status: string;
    followUpDate: string;
    assignedTo: { _id: string; name: string } | null;
  }[];
  revenueForecast: number;
  monthlyTrend: { _id: string; count: number }[];
}

export interface DuplicateGroup {
  group: { _id: string; leadId: string; name: string; email: string; phone: string; company: string; createdAt: string }[];
  matchedOn: string;
}

export interface LeadImportResult {
  imported: number;
  skipped: number;
}

// ---------- Notifications ----------
export interface Notification {
  _id: string;
  user: string | null;
  type: string;
  title: string;
  message: string;
  link: string;
  entityType: string;
  entityId: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

// ---------- Roles & permissions ----------
export interface Permission {
  _id: string;
  name: string;
  label: string;
  description: string;
  module: string;
  action: string;
  group: string;
}

export interface RoleDoc {
  _id: string;
  name: string;
  label: string;
  description: string;
  level: number;
  permissions: string[];
  system: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupedPermissions {
  [module: string]: Permission[];
}
