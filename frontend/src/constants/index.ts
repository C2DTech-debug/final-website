import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Layers,
  UserCog,
  MessageSquareQuote,
  HelpCircle,
  Mail,
  Calculator,
  BarChart3,
  Image,
  Search,
  Settings,
  ScrollText,
  FileText,
  Briefcase,
  Bell,
  ShieldCheck,
  ListTodo,
  ClipboardList,
  CalendarClock,
  Coins,
} from "lucide-react";

export const SITE_NAME = "C2D Tech";
export const SITE_TAGLINE = "Developer Friends Squad in Trichy";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blogs" },
  { label: "Careers", href: "/careers" },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
] as const;

export const TECH_STACK = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "MongoDB",
  "PostgreSQL",
  "Express",
  "Tailwind CSS",
  "AWS",
  "Docker",
  "Cloudflare",
  "GraphQL",
  "Redis",
  "Python",
  "Flutter",
  "React Native",
  "Vue",
  "GitHub Actions",
];

export const LEAD_STATUSES = [
  { value: "new", label: "New", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  { value: "contacted", label: "Contacted", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  { value: "qualified", label: "Qualified", color: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30" },
  { value: "proposal_sent", label: "Proposal Sent", color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" },
  { value: "negotiation", label: "Negotiation", color: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  { value: "follow_up", label: "Follow Up", color: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30" },
  { value: "won", label: "Won", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { value: "lost", label: "Lost", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
  { value: "on_hold", label: "On Hold", color: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30" },
] as const;

export const LEAD_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30" },
  { value: "medium", label: "Medium", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  { value: "high", label: "High", color: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  { value: "urgent", label: "Urgent", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
] as const;

export const LEAD_SOURCES = [
  "contact_form", "estimator", "manual", "import", "website_chat", "whatsapp", "phone_call",
  "email", "facebook_ads", "google_ads", "referral", "walk_in", "api",
] as const;

export const JOB_TYPES_CONST = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
] as const;

export const APPLICATION_STATUSES = [
  { value: "new", label: "New", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  { value: "under_review", label: "Under Review", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  { value: "interview", label: "Interview", color: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30" },
  { value: "offered", label: "Offered", color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" },
  { value: "hired", label: "Hired", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { value: "rejected", label: "Rejected", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
] as const;

export const NOTIFICATION_TYPES: Record<string, string> = {
  contact: "Contact",
  lead: "Lead",
  estimate: "Estimate",
  blog: "Blog",
  career: "Career",
  system: "System",
  login: "Login",
  error: "Error",
};

export const ESTIMATE_STATUSES = [
  { value: "new", label: "New", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  { value: "contacted", label: "Contacted", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  { value: "quoted", label: "Quoted", color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" },
  { value: "won", label: "Won", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { value: "lost", label: "Lost", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
] as const;

export const PORTFOLIO_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
] as const;

export const ENTITY_LABELS: Record<string, string> = {
  service: "Services",
  portfolio: "Portfolio",
  team: "Team",
  testimonial: "Testimonials",
  faq: "FAQs",
  blog: "Blog",
  career: "Careers",
};

export const SETTING_GROUPS = [
  { value: "company", label: "Company Details" },
  { value: "hero", label: "Hero Section" },
  { value: "homepage", label: "Homepage" },
  { value: "about", label: "About Section" },
  { value: "process", label: "Process Timeline" },
  { value: "statistics", label: "Statistics" },
  { value: "whyChooseUs", label: "Why Choose Us" },
  { value: "contact", label: "Contact Info" },
  { value: "social", label: "Social Media" },
  { value: "footer", label: "Footer" },
  { value: "estimator", label: "Project Estimator" },
  { value: "misc", label: "Miscellaneous" },
] as const;

export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  section?: string;
  badge?: string;
  permission?: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard:view" },
  { title: "Leads", href: "/admin/leads", icon: Users, badge: "CRM", permission: "leads:view" },
  { title: "Estimates", href: "/admin/estimates", icon: Calculator, permission: "estimates:view" },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "analytics:view" },
  { title: "Newsletter", href: "/admin/newsletter", icon: Mail, permission: "subscribers:view" },
  { title: "Blog", href: "/admin/blogs", icon: FileText, section: "Content", permission: "blogs:view" },
  { title: "Careers", href: "/admin/careers", icon: Briefcase, section: "Content", permission: "careers:view" },
  { title: "Portfolio", href: "/admin/portfolio", icon: FolderKanban, section: "Content", permission: "portfolio:view" },
  { title: "Services", href: "/admin/services", icon: Layers, section: "Content", permission: "services:view" },
  { title: "Team", href: "/admin/team", icon: UserCog, section: "Content", permission: "team:view" },
  { title: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote, section: "Content", permission: "testimonials:view" },
  { title: "FAQs", href: "/admin/faqs", icon: HelpCircle, section: "Content", permission: "faqs:view" },
  { title: "My Tasks", href: "/admin/tasks/my", icon: ClipboardList, section: "Tasks", permission: "tasks:view" },
  { title: "Tasks", href: "/admin/tasks", icon: ListTodo, section: "Tasks", permission: "tasks:view_all" },
  { title: "Attendance", href: "/admin/attendance", icon: CalendarClock, section: "Tasks", permission: "attendance:view" },
  { title: "Points & Payroll", href: "/admin/payroll", icon: Coins, section: "Tasks", permission: "payroll:view" },
  { title: "Media Library", href: "/admin/media", icon: Image, section: "Tools", permission: "media:view" },
  { title: "SEO Manager", href: "/admin/seo", icon: Search, section: "Tools", permission: "seo:manage" },
  { title: "Website Settings", href: "/admin/settings", icon: Settings, section: "Tools", permission: "settings:manage" },
  { title: "Notifications", href: "/admin/notifications", icon: Bell, section: "Tools", permission: "dashboard:view" },
  { title: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck, section: "Tools", permission: "roles:manage" },
  { title: "Users & Roles", href: "/admin/users", icon: Users, section: "Tools", permission: "users:manage" },
  { title: "Activity Logs", href: "/admin/activity", icon: ScrollText, section: "Tools", permission: "audit:view" },
];

export const SERVICE_ICON_OPTIONS = [
  "Globe", "Smartphone", "Code2", "Bot", "Cloud", "Megaphone", "Rocket", "Shield", "Database", "Sparkles",
];

export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop&crop=faces";
