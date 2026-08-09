import { connectDB, disconnectDB } from "../config/db";
import { env } from "../config/env";
import { AdminUserModel } from "../models/AdminUser";
import { ServiceModel } from "../models/Service";
import { TeamMemberModel } from "../models/TeamMember";
import { PortfolioProjectModel } from "../models/PortfolioProject";
import { TestimonialModel } from "../models/Testimonial";
import { FAQModel } from "../models/FAQ";
import { WebsiteSettingModel } from "../models/WebsiteSetting";
import { SEOSettingModel } from "../models/SEOSetting";
import { BlogModel } from "../models/Blog";
import { JobModel } from "../models/Job";
import { RoleModel } from "../models/Role";
import { PermissionModel } from "../models/Permission";
import { PERMISSION_CATALOG } from "../types";

/**
 * Seeds the full C2D Tech database with production-quality demo content.
 * Idempotent: existing documents are left untouched (except system-role
 * permissions, which are refreshed to the canonical catalog on each run).
 * Usage: npm run seed
 */

const CORE_PERMISSIONS = PERMISSION_CATALOG;

const ROLES = [
  { name: "super_admin", label: "Super Admin", description: "Full access to every module including users, roles and system configuration.", level: 5, system: true, permissions: CORE_PERMISSIONS.map((p) => p.name) },
  { name: "admin", label: "Admin", description: "Manage content, leads, CRM, media, settings, tasks and payroll.", level: 4, system: true, permissions: CORE_PERMISSIONS.map((p) => p.name) },
  { name: "project_manager", label: "Project Manager", description: "Owns the lead pipeline, contacts, estimates, portfolio content, tasks and verification.", level: 3, system: true, permissions: ["dashboard:view", "analytics:view", "leads:view", "leads:create", "leads:update", "leads:delete", "leads:assign", "leads:export", "contacts:view", "contacts:update", "contacts:reply", "contacts:delete", "estimates:view", "estimates:update", "estimates:delete", "services:view", "services:create", "services:update", "services:delete", "portfolio:view", "portfolio:create", "portfolio:update", "portfolio:delete", "team:view", "team:create", "team:update", "team:delete", "testimonials:view", "testimonials:create", "testimonials:update", "testimonials:delete", "faqs:view", "faqs:create", "faqs:update", "faqs:delete", "blogs:view", "blogs:create", "blogs:update", "blogs:delete", "blogs:publish", "careers:view", "careers:create", "careers:update", "careers:delete", "applications:view", "applications:update", "applications:delete", "subscribers:view", "media:view", "media:upload", "media:delete", "tasks:view", "tasks:view_all", "tasks:create", "tasks:update", "tasks:delete", "tasks:verify", "attendance:view", "attendance:view_all", "payroll:view"] },
  { name: "marketing_manager", label: "Marketing Manager", description: "Manages blogs, testimonials, FAQs, newsletter and marketing content.", level: 2, system: true, permissions: ["dashboard:view", "analytics:view", "leads:view", "leads:update", "contacts:view", "contacts:reply", "services:view", "portfolio:view", "testimonials:view", "testimonials:create", "testimonials:update", "faqs:view", "faqs:create", "faqs:update", "blogs:view", "blogs:create", "blogs:update", "blogs:publish", "subscribers:view", "media:view", "media:upload", "seo:manage"] },
  { name: "content_editor", label: "Content Editor", description: "Creates and edits content without publishing or managing users.", level: 1, system: true, permissions: ["dashboard:view", "analytics:view", "leads:view", "services:view", "services:create", "services:update", "portfolio:view", "portfolio:create", "portfolio:update", "team:view", "team:create", "team:update", "testimonials:view", "testimonials:create", "testimonials:update", "faqs:view", "faqs:create", "faqs:update", "blogs:view", "blogs:create", "blogs:update", "subscribers:view"] },
  { name: "developer", label: "Developer", description: "Tracks assigned tasks, submits work, and views attendance and points.", level: 0, system: true, permissions: ["tasks:view", "tasks:submit", "attendance:view", "payroll:view"] },
];

async function upsertSetting(group: string, key: string, label: string, value: unknown, type = "text") {
  await WebsiteSettingModel.updateOne({ group, key }, { $setOnInsert: { label, value, type } }, { upsert: true });
}

async function seedSettings() {
  await upsertSetting("company", "name", "Company Name", "C2D Tech (Concept to Deploy)");
  await upsertSetting("company", "tagline", "Tagline", "Developer Friends Squad in Trichy");
  await upsertSetting("company", "description", "Company description", "We build high-performance websites, mobile apps & AI automation systems.");
  await upsertSetting("company", "email", "Support email", "concept2deploytech@gmail.com");
  await upsertSetting("company", "phone", "Primary phone", "+91 7904006320");
  await upsertSetting("company", "phone2", "Secondary phone", "+91 7397578509");
  await upsertSetting("company", "address", "Office address", "2/62 First Main Road, Ganesh Nagar, Kattur, Trichy-620019, Tamil Nadu, India");
  await upsertSetting("company", "city", "City", "Trichy");
  await upsertSetting("company", "established", "Established", "2022");

  await upsertSetting("hero", "badge", "Hero badge", "C2D Tech — Concept to Deploy");
  await upsertSetting("hero", "title", "Hero title", "We build digital products");
  await upsertSetting("hero", "highlight", "Hero highlighted word", "from concept to deploy");
  await upsertSetting("hero", "subtitle", "Hero subtitle", "A developer friends squad in Trichy crafting premium websites, mobile apps, AI automation and cloud solutions for ambitious businesses.");
  await upsertSetting("hero", "ctaPrimaryLabel", "Primary CTA label", "Start Your Project");
  await upsertSetting("hero", "ctaPrimaryHref", "Primary CTA link", "/estimator");
  await upsertSetting("hero", "ctaSecondaryLabel", "Secondary CTA label", "See Our Work");
  await upsertSetting("hero", "ctaSecondaryHref", "Secondary CTA link", "/portfolio");

  await upsertSetting("statistics", "items", "Stat counters", [
    { label: "Projects Delivered", value: 40, suffix: "+" },
    { label: "Client Satisfaction", value: 98, suffix: "%" },
    { label: "Support", value: 24, suffix: "/7" },
    { label: "Avg. Render Speed", value: 100, suffix: "ms" },
  ], "json");

  await upsertSetting("about", "eyebrow", "About eyebrow", "Who we are");
  await upsertSetting("about", "heading", "About heading", "Concept to Deploy — one squad");
  await upsertSetting("about", "content", "About content", "C2D Tech (Concept to Deploy) was founded by a close group of developer friends in Trichy who shared a vision: to replace bloated, slow web software with high-performance, modern UI/UX, AI-automated digital solutions.\n\nFrom startup MVPs to enterprise AI tools, we turn concepts into high-converting digital solutions.");
  await upsertSetting("about", "image", "About image", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=900&fit=crop");
  await upsertSetting("about", "points", "About highlights", ["High performance websites", "AI-first automation", "Modern UI/UX", "24/7 dedicated support"], "json");
  await upsertSetting("about", "expYears", "Years of experience", "5+");

  await upsertSetting("process", "heading", "Process heading", "The Concept to Deploy Process");
  await upsertSetting("process", "description", "Process description", "6 streamlined steps to turn your business idea into a production-ready digital asset.");
  await upsertSetting("process", "steps", "Process steps", [
    { title: "Concept", description: "In-depth consultation with our Trichy dev team to map user journeys and technical specs." },
    { title: "Prototype", description: "Modern UI/UX mockups, interactive wireframes, and architecture blueprints." },
    { title: "Build", description: "Clean, high-performance modular coding with daily progress updates." },
    { title: "AI Integration", description: "Connecting smart LLM workflows, automated leadgen, and chatbot logic." },
    { title: "Deploy", description: "Automated CI/CD deployment, SSL configuration, and performance verification." },
    { title: "24/7 Support", description: "Round-the-clock maintenance, monitoring, and proactive cloud scaling." },
  ], "json");

  await upsertSetting("whyChooseUs", "heading", "Why choose us heading", "Why teams choose C2D Tech");
  await upsertSetting("whyChooseUs", "description", "Why choose us description", "We engineer high-performance, AI-automated digital solutions with zero bureaucracy.");
  await upsertSetting("whyChooseUs", "points", "Why choose us points", [
    { title: "Modern Tech Stack", description: "We engineer platforms using React 18, React Native, Node.js, Python, OpenAI LLMs and cloud-native DevOps." },
    { title: "AI-Driven Approach", description: "We integrate smart AI automation, 24/7 chatbots, and leadgen workflows to accelerate business performance." },
    { title: "Friends Together Synergy", description: "Founded by close developer friends in Trichy — our internal synergy ensures zero bureaucracy and rapid execution." },
    { title: "Dedicated 24/7 Support", description: "Direct developer access round-the-clock for technical guidance, infrastructure scaling, and client assistance." },
    { title: "Sub-Second Speed", description: "Every platform is engineered for sub-second rendering and high conversion rates." },
    { title: "Security First", description: "OWASP-aligned engineering with SSL, CI/CD pipelines, and cloud auto-scaling built in." },
  ], "json");

  await upsertSetting("contact", "email", "Contact email", "concept2deploytech@gmail.com");
  await upsertSetting("contact", "phone", "Contact phone", "+91 7904006320");
  await upsertSetting("contact", "phone2", "Contact phone 2", "+91 7397578509");
  await upsertSetting("contact", "address", "Contact address", "2/62 First Main Road, Ganesh Nagar, Kattur, Trichy-620019, Tamil Nadu, India");
  await upsertSetting("contact", "hours", "Support hours", "24/7 Dedicated Support");

  await upsertSetting("social", "whatsapp", "WhatsApp", "917904006320");
  await upsertSetting("social", "instagram", "Instagram", "");
  await upsertSetting("social", "linkedin", "LinkedIn", "");
  await upsertSetting("social", "github", "GitHub", "");
  await upsertSetting("social", "twitter", "Twitter / X", "");

  await upsertSetting("footer", "about", "Footer about", "C2D Tech (Concept to Deploy). Built by a squad of close developer friends in Trichy delivering high-performance websites, mobile apps, AI automation systems, and digital solutions.");
  await upsertSetting("footer", "copyright", "Footer copyright", "© 2026 C2D Tech (Concept to Deploy). All Rights Reserved.");
  await upsertSetting("footer", "madeWith", "Handcrafted note", "Handcrafted with ❤ by founding friends in Trichy");

  await upsertSetting("estimator", "basePrices", "Base prices by service slug", {
    "website-development": 4999,
    "mobile-apps": 14999,
    "software-development": 19999,
    "ai-automation": 9999,
    "cloud-devops": 7999,
    "digital-marketing": 4999,
  }, "json");
  await upsertSetting("estimator", "addons", "Estimator add-ons", [
    { id: "modern-ui-ux", label: "Modern UI/UX Theme & Smooth FX", price: 1499 },
    { id: "ai-chatbot", label: "24/7 AI Chatbot & Workflows", price: 2499 },
    { id: "leadgen", label: "Automated LeadGen Pipeline", price: 1999 },
    { id: "user-auth", label: "User Auth & Role Control", price: 1499 },
    { id: "payments", label: "Razorpay / UPI Payment Gateway", price: 1999 },
    { id: "seo-speed", label: "Sub-Second Speed & Technical SEO", price: 1499 },
    { id: "docker-cicd", label: "Docker & CI/CD Deployment", price: 2499 },
  ], "json");
  await upsertSetting("estimator", "timeline", "Delivery timeline config", { base: 7, perService: 7 }, "json");
  await upsertSetting("estimator", "currency", "Estimator currency", "₹");

  await upsertSetting("misc", "whatsappNumber", "WhatsApp float number", "917904006320");
  await upsertSetting("misc", "maintenance", "Maintenance notice", "");
  await upsertSetting("misc", "googleAnalyticsId", "Google Analytics ID", "");
}

async function seedSeo() {
  const pages = [
    { page: "global", title: "C2D Tech — Concept to Deploy | Websites, Apps & AI Automation", description: "Premium web development, mobile apps, AI automation and cloud solutions by a developer friends squad in Trichy." },
    { page: "home", title: "C2D Tech (Concept to Deploy) — Websites, Mobile Apps & AI Automation", description: "We build high-performance websites, mobile apps, AI chatbots and cloud infrastructure. Developer friends squad in Trichy, serving globally. 24/7 support." },
    { page: "services", title: "Services — C2D Tech", description: "High-performance websites, Android & iOS apps, custom software, AI automation, cloud & DevOps and digital marketing. Starting at ₹4,999." },
    { page: "portfolio", title: "Portfolio — C2D Tech", description: "Explore selected web platforms and mobile apps deployed by C2D Tech for clients in Trichy and beyond." },
    { page: "about", title: "About — C2D Tech", description: "C2D Tech was founded by a close group of developer friends in Trichy. Direct developer access with zero bureaucracy." },
    { page: "team", title: "Our Squad — C2D Tech", description: "Meet the developer friends squad behind C2D Tech — engineers, designers, AI specialists and project managers in Trichy." },
    { page: "contact", title: "Contact — C2D Tech", description: "Reach out to our Trichy team for instant project estimates, tech consultations, or 24/7 client support." },
    { page: "estimator", title: "Project Estimator — C2D Tech", description: "Configure your project and get an instant estimate in Indian Rupees. Freelancer-friendly pricing." },
    { page: "blogs", title: "Blog — C2D Tech", description: "Web performance insights, AI workflow tools, and engineering notes from the C2D Tech friends squad." },
    { page: "careers", title: "Careers — C2D Tech", description: "Join the developer friends squad in Trichy. Open roles across engineering, AI and design." },
  ];
  for (const p of pages) {
    await SEOSettingModel.updateOne(
      { page: p.page },
      { $setOnInsert: { ...p, ogType: "website", twitterCard: "summary_large_image", keywords: "c2d tech, web development trichy, mobile apps, ai automation, devops" } },
      { upsert: true }
    );
  }
}

async function seedServices() {
  const services = [
    {
      name: "High Speed Website Development", slug: "website-development", tagline: "Corporate sites, e-commerce stores and web apps engineered for sub-second rendering.",
      icon: "Globe", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&h=675&fit=crop",
      shortDescription: "Corporate websites, e-commerce platforms, portfolios and custom web applications with sub-second render speeds and high conversions.",
      description: "We engineer corporate websites, e-commerce stores, interactive portfolios, and custom web applications optimized for sub-second rendering and high conversions. Every build uses modern React/Next.js architecture, edge caching, and AI-driven performance tooling.",
      features: ["Sub-second render speed", "SEO-first architecture", "Mobile-first responsive UI", "CMS-backed editable content", "AI chatbot integration ready", "Analytics & conversion tracking"],
      deliverables: ["Corporate Sites", "E-Commerce Platforms", "Portfolios", "Custom Web Apps"],
      pricing: { enabled: true, startingAt: 4999, currency: "INR", priceLabel: "Starting At", deliveryDays: 7 },
      category: "Web Development", order: 1, published: true,
    },
    {
      name: "Android & iOS App Development", slug: "mobile-apps", tagline: "Cross-platform native apps with React Native for startups and enterprise teams.",
      icon: "Smartphone", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=675&fit=crop",
      shortDescription: "Cross-platform native mobile applications built with React Native for startups, SaaS platforms, and enterprise operation teams.",
      description: "We build cross-platform native mobile applications with React Native that run at 60fps on Android and iOS from a single codebase. From SaaS MVPs to enterprise operation apps, we handle the full lifecycle including app store publishing.",
      features: ["Single codebase, native performance", "Push notifications & offline support", "Secure auth & payment integration", "App store publishing (Play/App Store)", "CI/CD for mobile releases", "Analytics & crash reporting"],
      deliverables: ["Android & iOS Apps", "React Native Builds", "SaaS Mobile MVPs", "App Store Publishing"],
      pricing: { enabled: true, startingAt: 14999, currency: "INR", priceLabel: "Starting At", deliveryDays: 21 },
      category: "Mobile Development", order: 2, published: true,
    },
    {
      name: "Custom Tools Software Development", slug: "software-development", tagline: "Bespoke CRM, ERP and internal tooling built for your exact workflow.",
      icon: "Code2", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop",
      shortDescription: "Bespoke CRM systems, interactive executive dashboards, enterprise ERP solutions, and automated business tools.",
      description: "We design and build bespoke CRM systems, interactive executive dashboards, enterprise ERP solutions, and automated business tools. Our software development process is modular, testable, and designed to scale with your team.",
      features: ["Custom CRM & ERP systems", "Executive dashboards", "Role-based access control", "API & third-party integrations", "Automated business workflows", "Data migrations"],
      deliverables: ["CRM Systems", "Interactive Admin Dashboards", "ERP Solutions", "Custom Internal Tools"],
      pricing: { enabled: true, startingAt: 19999, currency: "INR", priceLabel: "Starting At", deliveryDays: 30 },
      category: "Software", order: 3, published: true,
    },
    {
      name: "AI-First AI Automation Systems", slug: "ai-automation", tagline: "24/7 intelligent chatbots, lead generation pipelines and custom LLM workflows.",
      icon: "Bot", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=675&fit=crop",
      shortDescription: "24/7 intelligent AI chatbots, automated lead generation pipelines, custom LLM workflows, and AI tool integrations.",
      description: "We integrate smart AI automation into your business: 24/7 intelligent chatbots, automated lead generation pipelines, custom LLM workflows, and OpenAI tool integrations that accelerate business performance around the clock.",
      features: ["24/7 AI chatbots", "Automated lead generation", "Custom LLM workflows", "OpenAI & GPT integrations", "Knowledge-base grounding", "Human handoff workflows"],
      deliverables: ["24/7 AI Chatbots", "Automated LeadGen Systems", "Custom AI Workflows", "OpenAI & LLM Tools"],
      pricing: { enabled: true, startingAt: 9999, currency: "INR", priceLabel: "Starting At", deliveryDays: 14 },
      category: "AI", order: 4, published: true,
    },
    {
      name: "Scalable Infra Cloud Solutions & DevOps", slug: "cloud-devops", tagline: "AWS setup, CI/CD pipelines and auto-scaling infrastructure that never sleeps.",
      icon: "Cloud", image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&h=675&fit=crop",
      shortDescription: "AWS & cloud setup, DevOps automation, CI/CD deployment pipelines, containerization, and 24/7 high availability.",
      description: "We set up AWS and cloud infrastructure with DevOps automation, CI/CD deployment pipelines, containerization with Docker, and auto-scaling load-balanced architecture for 24/7 high availability.",
      features: ["AWS & cloud setup", "DevOps automation", "CI/CD pipelines", "Docker & Kubernetes", "Auto-scaling & load balancing", "Monitoring & alerting"],
      deliverables: ["Cloud Infrastructure", "DevOps Automation", "CI/CD Pipelines", "Auto-Scaling & Load Balancing"],
      pricing: { enabled: true, startingAt: 7999, currency: "INR", priceLabel: "Starting At", deliveryDays: 14 },
      category: "Infrastructure", order: 5, published: true,
    },
    {
      name: "Growth Driven Digital Marketing & SEO", slug: "digital-marketing", tagline: "Technical SEO, paid ads and growth strategy that turns traffic into revenue.",
      icon: "Megaphone", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop",
      shortDescription: "Technical & on-page SEO optimization, social media management, targeted paid ad campaigns (Meta/Google), and growth strategy.",
      description: "We drive technical & on-page SEO optimization, social media management, targeted paid ad campaigns on Meta and Google, and data-backed growth strategy to turn traffic into high-intent leads.",
      features: ["Technical & on-page SEO", "Social media management", "Meta & Google paid ads", "Conversion rate optimization", "Growth strategy & reporting", "Lead generation"],
      deliverables: ["Technical SEO", "Social Media Strategy", "Paid Ads Campaigns", "Lead Generation"],
      pricing: { enabled: true, startingAt: 4999, currency: "INR", priceLabel: "Starting At", deliveryDays: 14 },
      category: "Marketing", order: 6, published: true,
    },
  ];
  for (const s of services) {
    const exists = await ServiceModel.findOne({ slug: s.slug });
    if (!exists) await ServiceModel.create(s);
  }
}

async function seedTeam() {
  const team = [
    { name: "Jawahar Sachin A", position: "Backend & Cloud Infrastructure Engineer", bio: "Architects robust REST/GraphQL microservices, PostgreSQL/Redis databases, Docker containers, and AWS cloud pipelines.", skills: ["Node.js", "Python", "AWS", "Cloud", "Docker", "DevOps & CI/CD"], email: "jawahar@c2dtech.in", order: 1, published: true },
    { name: "Aravindar C", position: "Lead Fullstack Architect", bio: "Pioneers ultra-fast web architectures, fullstack microservices, and high-performance React/Node platforms.", skills: ["React", "Node.js", "System Architecture", "AI Workflows", "TypeScript"], email: "aravindar@c2dtech.in", order: 2, published: true },
    { name: "Deepak B", position: "Mobile & Frontend Engineer", bio: "Crafts cross-platform Android & iOS apps with React Native, PWA experiences, and slick 60fps mobile-responsive web UIs.", skills: ["React Native", "Android & iOS", "Frontend UI/UX", "Claymorphism", "SaaS MVPs"], email: "deepak@c2dtech.in", order: 3, published: true },
    { name: "Jaiyand Anand", position: "Data Analyst & AI Automation Specialist", bio: "Engineers custom AI chatbots, LLM workflows, automated lead generation systems, and data analytics pipelines.", skills: ["Python", "OpenAI & LLMs", "AI Workflows", "LeadGen Automation", "Data Analytics"], email: "jaiyand@c2dtech.in", order: 4, published: true },
    { name: "Elakkiyah M", position: "DevOps/Cloud Engineer", bio: "Manages AWS & cloud infrastructure, DevOps automation, CI/CD deployment pipelines, and ensures 24/7 high availability.", skills: ["AWS", "DevOps", "CI/CD", "Docker", "Auto-Scaling & Load Balancing"], email: "elakkiyah@c2dtech.in", order: 5, published: true },
    { name: "Joe Piyansi J", position: "SEO/Digital Marketing Specialist", bio: "Drives technical & on-page SEO optimization, social media strategy, targeted paid ad campaigns on Meta and Google, and lead generation growth strategy.", skills: ["Technical SEO", "Social Media Strategy", "Paid Ads (Meta/Google)", "Lead Generation Growth Strategy"], email: "joepiyansi@c2dtech.in", order: 6, published: true },
    { name: "Sandhiya Kumar", position: "Project Manager / Client Coordinator", bio: "Oversees project scope, timelines, and delivery across all service verticals, and manages client communication from kickoff to final handover.", skills: ["Project Management", "Client Relations", "Agile Delivery", "Scope Planning", "Team Coordination"], email: "sandhiya@c2dtech.in", order: 7, published: true },
  ];
  for (const t of team) {
    const exists = await TeamMemberModel.findOne({ name: t.name });
    if (!exists) await TeamMemberModel.create(t);
  }
}

async function seedPortfolio() {
  const projects = [
    {
      title: "ShopNest — Modern E-Commerce Store", slug: "shopnest-ecommerce",
      shortDescription: "A high-converting fashion e-commerce platform with Razorpay checkout, AI product search and sub-second page loads.",
      description: "ShopNest is a full-stack e-commerce platform built with Next.js and Node.js, featuring dynamic product catalogs, AI-powered product search, Razorpay payment gateway, order tracking, and an admin CMS. Engineered for sub-second rendering across all devices.",
      coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=675&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=675&fit=crop"],
      liveUrl: "https://shopnest.example.com", githubUrl: "https://github.com/c2dtech/shopnest",
      technologies: ["Next.js", "Node.js", "MongoDB", "Razorpay", "Tailwind CSS"], category: "Fullstack E-Commerce",
      client: "ShopNest Retail", year: "2025", role: "Fullstack Development", featured: true, status: "published", tags: ["e-commerce", "razorpay", "next.js"],
      order: 1,
    },
    {
      title: "MediBook — Doctor Appointment Platform", slug: "medibook",
      shortDescription: "A modern UI/UX web app connecting patients with doctors — real-time slots, video consultations and AI triage.",
      description: "MediBook is a healthcare platform with a modern glassmorphism UI, real-time appointment slots, video consultation, and an AI triage assistant that helps patients find the right specialist.",
      coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop"],
      liveUrl: "https://medibook.example.com", githubUrl: "",
      technologies: ["React", "Node.js", "MongoDB", "Socket.io", "OpenAI"], category: "Modern UI/UX Web App",
      client: "MediBook Health", year: "2025", role: "Fullstack + AI Integration", featured: true, status: "published", tags: ["healthcare", "ai", "ui-ux"],
      order: 2,
    },
    {
      title: "EduPulse — Online Learning Platform", slug: "edupulse",
      shortDescription: "An educational platform with video courses, quizzes, progress tracking and role-based dashboards for learners and instructors.",
      description: "EduPulse is a full-featured educational platform featuring video course delivery, interactive quizzes, progress tracking, certifications, and role-based dashboards for learners, instructors, and administrators.",
      coverImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=675&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=675&fit=crop"],
      liveUrl: "https://edupulse.example.com", githubUrl: "",
      technologies: ["Next.js", "Node.js", "PostgreSQL", "AWS S3", "Stripe"], category: "Educational Platform",
      client: "EduPulse Learning", year: "2024", role: "Fullstack Engineering", featured: false, status: "published", tags: ["edtech", "video", "dashboard"],
      order: 3,
    },
    {
      title: "FinFlow — SaaS Finance Dashboard", slug: "finflow-saas",
      shortDescription: "A data-heavy SaaS dashboard with real-time charts, multi-tenant auth and automated invoicing workflows.",
      description: "FinFlow is a multi-tenant SaaS finance dashboard with real-time analytics charts, automated invoicing, subscription billing, and granular role-based access control for finance teams.",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop"],
      liveUrl: "https://finflow.example.com", githubUrl: "https://github.com/c2dtech/finflow",
      technologies: ["React", "Node.js", "MongoDB", "Redis", "Docker"], category: "Fullstack E-Commerce",
      client: "FinFlow Labs", year: "2024", role: "Architecture + Development", featured: true, status: "published", tags: ["saas", "dashboard", "fintech"],
      order: 4,
    },
  ];
  for (const p of projects) {
    const exists = await PortfolioProjectModel.findOne({ slug: p.slug });
    if (!exists) await PortfolioProjectModel.create(p);
  }
}

async function seedTestimonials() {
  const items = [
    { name: "Ramesh V", role: "Founder", company: "ShopNest Retail", content: "C2D Tech rebuilt our store and the difference is night and day. Page loads dropped to under half a second and conversions jumped 35% in the first month.", rating: 5, featured: true, published: true, order: 1 },
    { name: "Priya S", role: "Operations Head", company: "MediBook Health", content: "The AI triage chatbot they integrated now handles 70% of our appointment queries at midnight. It genuinely feels like having a 24/7 team member.", rating: 5, featured: true, published: true, order: 2 },
    { name: "Arun K", role: "CEO", company: "EduPulse Learning", content: "Fast delivery, zero bureaucracy, and direct access to the actual engineers. They deployed our learning platform ahead of schedule with no drop in quality.", rating: 5, featured: true, published: true, order: 3 },
    { name: "Divya M", role: "Finance Director", company: "FinFlow Labs", content: "Their dashboard and ERP tooling replaced three legacy systems. The team genuinely treats our project like their own — rare to find that mindset.", rating: 5, featured: true, published: true, order: 4 },
  ];
  for (const t of items) {
    const exists = await TestimonialModel.findOne({ name: t.name });
    if (!exists) await TestimonialModel.create(t);
  }
}

async function seedFaqs() {
  const items = [
    { question: "How fast can C2D Tech deliver my website?", answer: "Standard delivery for a high-performance website starts at 1 week. Express and urgent rush timelines are available through our estimator, which computes delivery time instantly based on your selections.", category: "Pricing", order: 1, published: true },
    { question: "What does the starting price include?", answer: "Starting prices cover a production-ready build with modern UI, mobile responsiveness, basic SEO, and 24/7 support. Add-ons like AI chatbots, payment gateways, and CI/CD pipelines can be configured in the estimator.", category: "Pricing", order: 2, published: true },
    { question: "Do you provide support after launch?", answer: "Yes — every project ships with 24/7 dedicated developer support. That means direct access to the engineers who built your product, for maintenance, monitoring, and scaling.", category: "Support", order: 3, published: true },
    { question: "Can you handle AI chatbots and automation for my business?", answer: "Absolutely. We build 24/7 AI chatbots, automated lead generation pipelines, and custom LLM workflows. Our AI systems can be grounded in your own content for accurate, on-brand responses.", category: "AI", order: 4, published: true },
    { question: "Which technologies do you use?", answer: "React 18, Next.js, React Native, Node.js, TypeScript, MongoDB, PostgreSQL, Python, OpenAI LLMs, Docker, and cloud-native DevOps on AWS.", category: "General", order: 5, published: true },
    { question: "Do you work with clients outside Trichy?", answer: "Yes — we are rooted in Trichy but serve clients globally with remote-first delivery, daily progress updates, and 24/7 support.", category: "General", order: 6, published: true },
    { question: "Can you take over an existing website or app?", answer: "Yes. We regularly migrate and modernize existing codebases — improving performance, security, and maintainability while preserving your data and content.", category: "General", order: 7, published: true },
    { question: "How do payments work?", answer: "We follow a milestone-based billing model. Typically 40% to kick off, 30% at prototype approval, and 30% at final delivery. Payments are accepted via UPI, bank transfer, or Razorpay.", category: "Pricing", order: 8, published: true },
  ];
  for (const f of items) {
    const exists = await FAQModel.findOne({ question: f.question });
    if (!exists) await FAQModel.create(f);
  }
}

async function seedBlogs() {
  const admin = (await AdminUserModel.findOne({ role: "super_admin" }).lean()) as unknown as { _id?: unknown } | null;
  const items = [
    {
      title: "Why Sub-Second Render Speed Matters for Your Business", slug: "sub-second-render-speed",
      excerpt: "Every 100ms of loading time you shave off can lift conversions by up to 7%. Here's how we engineer websites that render instantly.",
      content: "Performance is a business metric, not a technical nicety. Research consistently shows that sub-second load times dramatically improve engagement, SEO rankings, and conversion rates.\n\nAt C2D Tech, we engineer for speed from the ground up: server-side rendering, edge caching, image optimization, code splitting, and performance budgets enforced in CI/CD.\n\nIf your website takes more than 2 seconds to load, you are already losing customers. Let's fix that.",
      coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=675&fit=crop",
      category: "Web Performance", tags: ["performance", "seo", "next.js"],
      status: "published", publishedAt: new Date("2026-01-15"), featured: true, order: 1,
    },
    {
      title: "How We Built a 24/7 AI Chatbot That Sells", slug: "ai-chatbot-that-sells",
      excerpt: "A practical walkthrough of grounding LLMs in your business content and wiring them to lead generation pipelines.",
      content: "A chatbot that cannot sell is just a FAQ machine. The winning formula combines a retrieval-augmented knowledge base with an automated lead pipeline.\n\nStep one: ingest your products, pricing, and policies into a vector store. Step two: ground the LLM responses in that context with strict guardrails. Step three: detect buying intent and hand off to a human instantly.\n\nWe have deployed this exact architecture for e-commerce, healthcare, and SaaS clients in Trichy and beyond.",
      coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=675&fit=crop",
      category: "AI Automation", tags: ["ai", "chatbot", "leadgen"],
      status: "published", publishedAt: new Date("2026-02-02"), featured: true, order: 2,
    },
    {
      title: "React Native vs Native: What We Recommend in 2026", slug: "react-native-vs-native",
      excerpt: "Our honest take after shipping 15+ mobile apps — when to pick a single codebase and when native is the only right answer.",
      content: "For most startups, React Native delivers 90% of the native experience with one codebase and one team.\n\nWe recommend React Native when: you need to ship on both platforms fast, your UI complexity is moderate, and you want to reuse web skills. We recommend fully native when you're building GPU-heavy games, complex AR, or highly specialized device integrations.\n\nEvery app we ship targets 60fps scrolling, offline-first behavior, and automatic over-the-air updates.",
      coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=675&fit=crop",
      category: "Mobile", tags: ["react-native", "mobile", "startups"],
      status: "published", publishedAt: new Date("2026-02-20"), featured: false, order: 3,
    },
    {
      title: "A Developer Friends Checklist for Zero-Downtime Deploys", slug: "zero-downtime-deploys",
      excerpt: "Blue-green deployments, health checks, and rollbacks — the DevOps fundamentals we bake into every client pipeline.",
      content: "Downtime during a deploy is a choice, not a feature of the universe. With blue-green deployments, automated health checks, and instant rollbacks, we ship dozens of times a day with zero user impact.\n\nThe non-negotiables: containerized builds, immutable artifacts, migration-then-release ordering, and alerting that actually pages someone.\n\nIf your deploys give you anxiety, your pipeline needs an upgrade — and that is exactly what we do.",
      coverImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&h=675&fit=crop",
      category: "DevOps", tags: ["devops", "cicd", "docker", "aws"],
      status: "published", publishedAt: new Date("2026-03-10"), featured: false, order: 4,
    },
  ];
  for (const b of items) {
    const exists = await BlogModel.findOne({ slug: b.slug });
    if (!exists) await BlogModel.create({ ...b, author: admin?._id, authorName: "Team C2D Tech", readingTime: 4 });
  }
}

async function seedJobs() {
  const jobs = [
    {
      title: "Frontend Developer (React / Next.js)", slug: "frontend-developer-react",
      department: "Engineering", location: "Trichy, Tamil Nadu (Remote friendly)", type: "full_time", experience: "1–3 years", salary: "₹3,00,000 – ₹6,00,000 / year",
      description: "Join the C2D Tech friends squad building high-performance, AI-powered web platforms for clients across India.",
      responsibilities: ["Build fast, accessible React/Next.js interfaces", "Collaborate with designers and backend engineers", "Ship performance budgets and accessible UX"],
      requirements: ["Strong React + TypeScript skills", "Experience with Tailwind CSS and modern state management", "Understanding of web performance and Core Web Vitals"],
      benefits: ["Flexible remote-friendly work", "Direct access to founding engineers", "Learning budget and growth roadmap"],
      status: "open", featured: true, order: 1,
    },
    {
      title: "Backend Engineer (Node.js / MongoDB)", slug: "backend-engineer-node",
      department: "Engineering", location: "Trichy, Tamil Nadu (Remote friendly)", type: "full_time", experience: "2–4 years", salary: "₹4,00,000 – ₹8,00,000 / year",
      description: "Architect robust REST/GraphQL APIs, microservices, and cloud pipelines for enterprise clients.",
      responsibilities: ["Design REST/GraphQL APIs and data models", "Build scalable microservices on AWS", "Own observability, security, and performance"],
      requirements: ["Node.js + TypeScript expertise", "MongoDB/PostgreSQL experience", "Docker and CI/CD fundamentals"],
      benefits: ["Flexible remote-friendly work", "Direct access to founding engineers", "Learning budget and growth roadmap"],
      status: "open", featured: true, order: 2,
    },
    {
      title: "AI / ML Engineer (Python, LLMs)", slug: "ai-ml-engineer",
      department: "AI", location: "Trichy, Tamil Nadu (Remote friendly)", type: "full_time", experience: "1–3 years", salary: "₹4,00,000 – ₹9,00,000 / year",
      description: "Build 24/7 AI chatbots, retrieval pipelines, and automated lead generation systems using OpenAI and open-source LLMs.",
      responsibilities: ["Build RAG pipelines and vector stores", "Wire LLM workflows into client products", "Measure and improve AI response quality"],
      requirements: ["Python expertise", "Experience with OpenAI/LLM APIs", "Familiarity with data pipelines and analytics"],
      benefits: ["Flexible remote-friendly work", "Direct access to founding engineers", "Learning budget and growth roadmap"],
      status: "open", featured: false, order: 3,
    },
    {
      title: "DevOps / Cloud Engineer (AWS)", slug: "devops-cloud-engineer",
      department: "Infrastructure", location: "Trichy, Tamil Nadu (Remote friendly)", type: "full_time", experience: "2–4 years", salary: "₹4,00,000 – ₹8,00,000 / year",
      description: "Own CI/CD pipelines, containerization, auto-scaling and 24/7 availability for client infrastructure.",
      responsibilities: ["Build CI/CD pipelines with GitHub Actions", "Manage Docker/Kubernetes deployments", "Implement monitoring, alerts and disaster recovery"],
      requirements: ["AWS expertise (EC2, S3, RDS, ECS)", "Docker + CI/CD experience", "Infrastructure-as-code fundamentals (Terraform preferred)"],
      benefits: ["Flexible remote-friendly work", "Direct access to founding engineers", "Learning budget and growth roadmap"],
      status: "open", featured: false, order: 4,
    },
  ];
  for (const j of jobs) {
    const exists = await JobModel.findOne({ slug: j.slug });
    if (!exists) await JobModel.create(j);
  }
}

async function seedAdmin() {
  const existing = await AdminUserModel.findOne({ email: env.ADMIN_BOOTSTRAP.EMAIL.toLowerCase() });
  if (existing) return;
  await AdminUserModel.create({
    name: env.ADMIN_BOOTSTRAP.NAME,
    email: env.ADMIN_BOOTSTRAP.EMAIL.toLowerCase(),
    password: env.ADMIN_BOOTSTRAP.PASSWORD,
    role: "super_admin",
    isActive: true,
  });
  console.log(`[seed] Super Admin created: ${env.ADMIN_BOOTSTRAP.EMAIL}`);
}

async function run() {
  await connectDB();
  console.log("[seed] Seeding C2D Tech database…");

  for (const p of CORE_PERMISSIONS) {
    await PermissionModel.updateOne({ name: p.name }, { $setOnInsert: p }, { upsert: true });
  }
  for (const r of ROLES) {
    // System roles are code-defined: refresh their grants so they stay in sync
    // with the catalog. Custom roles are never touched by the seed.
    const update = r.system ? { $set: r } : { $setOnInsert: r };
    await RoleModel.updateOne({ name: r.name }, update, { upsert: true });
  }

  await seedAdmin();
  await seedSettings();
  await seedSeo();
  await seedServices();
  await seedTeam();
  await seedPortfolio();
  await seedTestimonials();
  await seedFaqs();
  await seedBlogs();
  await seedJobs();

  console.log("[seed] Done. Collections ready: services, team, portfolio, testimonials, faqs, blogs, jobs, roles, permissions, settings, seo.");
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
