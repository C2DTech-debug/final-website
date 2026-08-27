"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Globe,
  Smartphone,
  Bot,
  Cloud,
  Terminal,
  Zap,
  ShieldCheck,
  Code2,
} from "lucide-react";
import type { PublicSettings } from "@/types";

const SHOWCASE_TABS = [
  {
    id: "web",
    label: "Web Engineering",
    icon: Globe,
    headline: "High-Speed Full-Stack Web Applications",
    description: "Next.js 15 App Router architecture with sub-50ms TTFB and 100/100 Core Web Vitals.",
    metrics: [
      { label: "Lighthouse Score", value: "100/100" },
      { label: "Average TTFB", value: "<45ms" },
      { label: "SEO Architecture", value: "SSR + Edge" },
    ],
    codeSnippet: `// Next.js 15 Server-Driven Architecture
export async function getProductData(slug: string) {
  const data = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { metrics: true, analytics: true }
  });
  return { data, revalidate: 60 };
}`,
  },
  {
    id: "mobile",
    label: "Mobile Systems",
    icon: Smartphone,
    headline: "Cross-Platform iOS & Android Apps",
    description: "React Native & Expo native runtime delivering fluid 60fps performance and offline synchronization.",
    metrics: [
      { label: "Frame Rate", value: "60 FPS" },
      { label: "App Store Ready", value: "iOS & Android" },
      { label: "Sync Engine", value: "Offline-First" },
    ],
    codeSnippet: `// Native High-Performance Hook
export const useDeviceSync = (userId: string) => {
  const { isOnline } = useNetworkState();
  const queue = useOfflineQueue();
  useEffect(() => {
    if (isOnline) queue.flush();
  }, [isOnline]);
};`,
  },
  {
    id: "ai",
    label: "AI Automation",
    icon: Bot,
    headline: "Autonomous LLM Agents & Workflows",
    description: "Custom AI pipelines, vector retrieval (RAG), and intelligent task automation for enterprise teams.",
    metrics: [
      { label: "Latency", value: "<120ms" },
      { label: "Model Stack", value: "Claude + GPT-4o" },
      { label: "Agent Success", value: "99.4%" },
    ],
    codeSnippet: `// Autonomous Agent Pipeline
const agent = new StudioAgent({
  tools: [searchDB, generateArtifact, sendWebhook],
  memory: new VectorStoreMemory(),
  temperature: 0.2
});
await agent.execute(userWorkflow);`,
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    icon: Cloud,
    headline: "Scalable Infrastructure & CI/CD Pipelines",
    description: "Containerized microservices on AWS/Docker with zero-downtime rolling deploys and automated monitoring.",
    metrics: [
      { label: "Uptime SLA", value: "99.99%" },
      { label: "Deployment", value: "Zero Downtime" },
      { label: "Security", value: "SOC2 Ready" },
    ],
    codeSnippet: `// Docker Multi-Stage Production Build
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
EXPOSE 3000
CMD ["node", "server.js"]`,
  },
];

interface TechLogoItem {
  name: string;
  icon: React.ReactNode;
}

const TECH_LOGOS: TechLogoItem[] = [
  {
    name: "Next.js 15",
    icon: (
      <svg viewBox="0 0 180 180" className="h-6 w-6 fill-current">
        <mask height="180" id="mask0_next" maskUnits="userSpaceOnUse" width="180" x="0" y="0">
          <circle cx="90" cy="90" fill="black" r="90" />
        </mask>
        <g mask="url(#mask0_next)">
          <circle cx="90" cy="90" fill="currentColor" r="90" />
          <path d="M149.508 157.143L69.135 54H54V125.967H66.865V68.756L140.235 163.535C143.513 161.547 146.619 159.405 149.508 157.143Z" fill="white" />
          <rect fill="white" height="72" width="13" x="115" y="54" />
        </g>
      </svg>
    ),
  },
  {
    name: "React & React Native",
    icon: (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.2">
        <circle cx="0" cy="0" r="2.05" fill="currentColor" stroke="none" />
        <g stroke="currentColor">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: "TypeScript",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zM12.825 10.515h2.553v9.06h-2.553v-9.06zm-7.65 0h8.175v2.205h-2.82v6.855H7.995V12.72H5.175v-2.205zm14.49 3.015c.63 0 1.14.21 1.53.63.39.42.585.99.585 1.71 0 .75-.24 1.35-.72 1.8-.48.45-1.155.72-2.025.81-.6.06-1.17.06-1.71 0v1.89h-2.475v-6.84h4.815zm-2.475 2.115v1.23c.36.03.675.03.945 0 .33-.03.585-.12.765-.27.18-.15.27-.36.27-.63 0-.24-.075-.42-.225-.54-.15-.12-.39-.18-.72-.18h-1.035z" />
      </svg>
    ),
  },
  {
    name: "Node.js",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M12 0L1.5 6v12L12 24l10.5-6V6L12 0zm-1.05 17.7l-4.95-2.85v-5.7l4.95 2.85v5.7zm2.1 0v-5.7l4.95-2.85v5.7l-4.95 2.85zm6.45-9.6l-7.5 4.35-7.5-4.35 7.5-4.35 7.5 4.35z" />
      </svg>
    ),
  },
  {
    name: "Tailwind CSS",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
      </svg>
    ),
  },
  {
    name: "Python",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.006 2.75h5.82v.825H3.84S0 5.787 0 11.902c0 6.113 3.35 5.895 3.35 5.895h2V14.99s-.11-3.414 3.356-3.414h5.772s3.246.054 3.246-3.14V2.656S18.156 0 11.914 0zm-3.22 1.848a1.045 1.045 0 1 1 0 2.09 1.045 1.045 0 0 1 0-2.09zM12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.006-2.75h-5.82v-.825h8.186S24 18.213 24 12.098c0-6.113-3.35-5.895-3.35-5.895h-2v2.807s.11 3.414-3.356 3.414H9.522s-3.246-.054-3.246 3.14v5.779S5.844 24 12.086 24zm3.22-1.848a1.045 1.045 0 1 1 0-2.09 1.045 1.045 0 0 1 0 2.09z" />
      </svg>
    ),
  },
  {
    name: "Docker",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.714h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.208a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185M23.79 11.23c-.34-.78-1.25-1.2-2.18-1.02-.15.03-.31.08-.46.15-.43-.88-1.28-1.44-2.28-1.48-.12 0-.25 0-.37.02a.186.186 0 00-.16.14c-.39 1.48-.3 3.01.25 4.43-1.06 1.93-3.05 3.19-5.32 3.39-4.2.36-7.85-2.07-9.43-5.63l-.06-.13H.186A.186.186 0 000 13.23c.3 4.29 3.55 7.82 7.82 8.49 6.27.99 11.89-2.73 13.56-8.52.79.08 1.62-.2 2.12-.79.41-.49.52-1.12.29-1.68" />
      </svg>
    ),
  },
  {
    name: "PostgreSQL",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16.93V16h-2v2.93A8.005 8.005 0 0 1 4.07 13H7v-2H4.07A8.005 8.005 0 0 1 11 5.07V8h2V5.07A8.005 8.005 0 0 1 19.93 11H17v2h2.93A8.005 8.005 0 0 1 13 18.93z" />
      </svg>
    ),
  },
  {
    name: "AWS Cloud",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M6.54 11.23c-.15-.44-.38-.79-.69-1.05-.31-.26-.71-.39-1.2-.39-.4 0-.75.09-1.05.27-.3.18-.53.43-.69.75-.16.32-.24.7-.24 1.14 0 .42.08.79.24 1.11.16.32.39.57.69.75.3.18.65.27 1.05.27.49 0 .89-.13 1.2-.39.31-.26.54-.61.69-1.05.15-.44.22-.96.22-1.56 0-.58-.07-1.09-.22-1.45zm16.14 8.28c-1.19.88-2.61 1.57-4.26 2.07-1.65.5-3.37.75-5.16.75-2.28 0-4.38-.4-6.3-1.2-1.92-.8-3.51-1.93-4.77-3.39l1.71-1.62c1.02 1.17 2.28 2.07 3.78 2.7 1.5.63 3.12.95 4.86.95 1.41 0 2.76-.18 4.05-.54 1.29-.36 2.4-.87 3.33-1.53l2.76 1.81z" />
      </svg>
    ),
  },
  {
    name: "OpenAI",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.937a4.485 4.485 0 0 1 2.338-1.973V12.6a.766.766 0 0 0 .388.676l5.814 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 8.937zm15.82 3.863l-5.844-3.372 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.674 8.105v-5.682a.79.79 0 0 0-.403-.674zm2.02-3.863a4.505 4.505 0 0 1-.61 1.258l-4.784-2.764a.77.77 0 0 0-.78 0L8.163 10.8V8.468a.08.08 0 0 1 .033-.062l4.84-2.796a4.499 4.499 0 0 1 6.784 4.327zM12 13.5l-2.45-1.414 2.45-1.414 2.45 1.414L12 13.5z" />
      </svg>
    ),
  },
  {
    name: "FastAPI",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm-.92 19.354V12.92H8.39l4.53-7.274v6.434h2.69l-4.53 7.274z" />
      </svg>
    ),
  },
  {
    name: "Redis",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M1.378 17.065l9.288 4.79c.846.437 1.82.437 2.666 0l9.288-4.79c.848-.438 1.38-1.282 1.38-2.202v-3.726l-3.344 1.725v2.247L12 19.648 3.344 15.11v-2.247L0 11.137v3.726c0 .92.532 1.764 1.378 2.202zM12 2.142L1.378 7.62C.532 8.058 0 8.902 0 9.822c0 .92.532 1.764 1.378 2.202L12 17.508l10.622-5.484c.846-.438 1.378-1.282 1.378-2.202 0-.92-.532-1.764-1.378-2.202L12 2.142z" />
      </svg>
    ),
  },
];

const DOUBLED_TECH_LOGOS = [...TECH_LOGOS, ...TECH_LOGOS];

export function HeroSection({ settings }: { settings: PublicSettings }) {
  const [activeTab, setActiveTab] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const hero = (settings.hero ?? {}) as Record<string, unknown>;

  const badge = (hero.badge as string) || "Concept to Deploy · Digital Product Studio";
  const title = (hero.title as string) || "We build digital products";
  const highlight = (hero.highlight as string) || "from concept to deploy";
  const subtitle =
    (hero.subtitle as string) ||
    "A senior developer squad in Trichy crafting high-speed websites, mobile apps, AI automation and cloud systems for ambitious businesses.";

  const currentTab = SHOWCASE_TABS[activeTab];

  // Mouse & Cursor Motion Values
  const mouseX = useMotionValue(500);
  const mouseY = useMotionValue(300);

  const springConfig = { damping: 26, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Canvas Perspective Tilt
  const rotateX = useTransform(smoothY, [0, 800], [3, -3]);
  const rotateY = useTransform(smoothX, [0, 1200], [-3.5, 3.5]);

  const spotlightBg = useMotionTemplate`radial-gradient(650px circle at ${smoothX}px ${smoothY}px, rgba(66, 116, 217, 0.14), rgba(149, 204, 221, 0.06), transparent 75%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
    setCoords({ x: Math.round(x), y: Math.round(y) });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden pb-16 pt-28 sm:pt-36 md:pb-24"
    >
      {/* Interactive Cursor Spotlight */}
      <motion.div
        aria-hidden="true"
        style={{ background: spotlightBg }}
        className="pointer-events-none absolute inset-0 -z-10 opacity-100 transition-opacity duration-300"
      />

      {/* Background Architectural Grid & Subtle Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] opacity-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none transform-gpu absolute -top-40 left-1/2 -z-10 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-[#4274D9]/10 blur-[130px]"
      />

      <div className="container">
        {/* Main Editorial Header */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white"
          >
            {title} <br className="hidden sm:inline" />
            <span className="text-[#4274D9] dark:text-[#95CCDD]">{highlight}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg md:text-xl dark:text-slate-300 leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row"
          >
            <Link
              href={(hero.ctaPrimaryHref as string) || "/estimator"}
              className="group inline-flex h-12 items-center gap-2.5 rounded-lg bg-[#4274D9] px-7 text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3462c7] hover:shadow-md active:translate-y-0 active:scale-[0.99]"
            >
              {(hero.ctaPrimaryLabel as string) || "Start Your Project"}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href={(hero.ctaSecondaryHref as string) || "/portfolio"}
              className="inline-flex h-12 items-center gap-2.5 rounded-lg border-2 border-[#95CCDD] bg-white px-7 text-base font-bold text-[#293681] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4274D9] hover:bg-[#D0E7E6]/30 hover:text-[#4274D9] hover:shadow-sm active:translate-y-0 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-[#4274D9] dark:hover:bg-[#4274D9]/15 dark:hover:text-[#95CCDD]"
            >
              <Play className="h-4 w-4 fill-[#4274D9] text-[#4274D9]" />
              {(hero.ctaSecondaryLabel as string) || "See Our Work"}
            </Link>
          </motion.div>
        </div>

        {/* Senior Designer Interactive Studio Showcase Canvas with 3D Mouse Parallax Tilt */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            rotateX,
            rotateY,
            transformPerspective: 1200,
          }}
          className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_60px_rgba(41,54,129,0.08)] transition-shadow duration-300 dark:border-slate-800 dark:bg-slate-950"
        >
          {/* Top Window Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
            {/* Window Controls & Live Cursor Telemetry */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#293681]/80" />
                <span className="h-3 w-3 rounded-full bg-[#4274D9]/80" />
                <span className="h-3 w-3 rounded-full bg-[#95CCDD]" />
              </div>
              <div className="hidden items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 sm:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Terminal className="h-3 w-3 text-[#4274D9]" />{" "}
                <span>
                  c2d-studio // {coords.x > 0 ? `pos:[${coords.x},${coords.y}]` : "production-core"}
                </span>
              </div>
            </div>

            {/* Interactive Capability Tabs */}
            <div className="flex items-center gap-1">
              {SHOWCASE_TABS.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === index;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(index)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-[#4274D9] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showcase Content Area */}
          <div className="grid gap-6 p-6 lg:grid-cols-12 lg:p-8">
            {/* Left Column: Capability Specs & Live Verified Metrics */}
            <div className="flex flex-col justify-between space-y-6 lg:col-span-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-[#95CCDD] bg-[#D0E7E6]/40 px-2.5 py-1 text-xs font-bold text-[#293681] dark:border-[#4274D9]/40 dark:bg-[#4274D9]/15 dark:text-[#95CCDD]">
                  <Zap className="h-3.5 w-3.5 text-[#4274D9]" /> Verified Architecture
                </div>
                <h3 className="mt-3 font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                  {currentTab.headline}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {currentTab.description}
                </p>
              </div>

              {/* Verified Performance Metrics */}
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                {currentTab.metrics.map((metric) => (
                  <div key={metric.label}>
                    <p className="font-display text-base font-extrabold text-[#293681] dark:text-[#95CCDD] sm:text-lg">
                      {metric.value}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Production Grade
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#4274D9]" /> Enterprise Security
                </span>
              </div>
            </div>

            {/* Right Column: Code & Architecture View */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] p-5 font-mono text-xs text-slate-200 shadow-inner lg:col-span-7">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Code2 className="h-3.5 w-3.5 text-[#95CCDD]" />
                  <span>snippet.{currentTab.id === "ai" ? "ts" : currentTab.id === "cloud" ? "dockerfile" : "tsx"}</span>
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-[#95CCDD]">Clean Code</span>
              </div>
              <pre className="overflow-x-auto py-4 text-xs leading-relaxed text-emerald-400 dark:text-emerald-300">
                <code>{currentTab.codeSnippet}</code>
              </pre>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                <span>// Zero Technical Debt</span>
                <span className="text-[#95CCDD]">Strict Type Checking ✓</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technology Marquee / Trust Strip with Circular App Logos Auto Scrolling Sideways */}
        <div className="mt-14 border-t border-slate-200/80 pt-8 dark:border-slate-800">
          <p className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Powered by Modern Engineering Standards
          </p>

          <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-2">
            <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]">
              {DOUBLED_TECH_LOGOS.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  title={item.name}
                  className="group relative flex items-center gap-3 rounded-full border border-slate-200/90 bg-white/95 px-3 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#4274D9] hover:bg-slate-50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/95 dark:hover:border-[#4274D9]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D0E7E6]/40 text-[#293681] transition-colors group-hover:bg-[#4274D9] group-hover:text-white dark:bg-[#4274D9]/15 dark:text-[#95CCDD]">
                    {item.icon}
                  </div>
                  <span className="pr-2 text-xs font-bold text-slate-700 transition-colors group-hover:text-[#293681] dark:text-slate-300 dark:group-hover:text-white">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
