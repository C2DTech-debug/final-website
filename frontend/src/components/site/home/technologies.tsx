"use client";

import { TECH_STACK } from "@/constants";
import { Reveal } from "@/components/site/reveal";
import { Code2, Cpu, Database, Server, Terminal, Workflow, Cloud, ShieldCheck } from "lucide-react";

const STACK_GRID = [
  { name: "Next.js 15 & React 19", category: "Full-Stack Web", icon: Code2, badge: "App Router" },
  { name: "FastAPI & Python", category: "AI & APIs", icon: Cpu, badge: "Pydantic V2" },
  { name: "PostgreSQL & Prisma", category: "Relational DB", icon: Database, badge: "Connection Pool" },
  { name: "Redis Cache Cluster", category: "Sub-5ms Latency", icon: Server, badge: "Key-Value" },
  { name: "LangChain & Claude/OpenAI", category: "Autonomous AI", icon: Workflow, badge: "Agents" },
  { name: "Docker & AWS ECS", category: "100k Cloud DevOps", icon: Cloud, badge: "Auto-Scale" },
  { name: "React Native & Flutter", category: "Mobile Apps", icon: Terminal, badge: "iOS & Android" },
  { name: "PKI Digital Signature", category: "Security & DSC", icon: ShieldCheck, badge: "IT Act Compliant" },
];

const CARD_THEMES = [
  {
    // 0: Deep Royal Navy
    card: "bg-[#293681] text-white border-[#293681] shadow-sm hover:shadow-md hover:border-[#95CCDD] dark:bg-[#293681] dark:border-[#4274D9]/50",
    iconBox: "bg-white/15 text-[#95CCDD] group-hover:bg-white group-hover:text-[#293681]",
    badge: "bg-white/15 text-[#D0E7E6] font-bold",
    title: "text-white",
    category: "text-[#95CCDD]",
  },
  {
    // 1: Soft Mint / Aqua
    card: "bg-[#D0E7E6]/85 border-[#95CCDD] text-[#293681] shadow-sm hover:shadow-md hover:border-[#4274D9] dark:bg-[#D0E7E6]/20 dark:border-[#95CCDD]/40 dark:text-white",
    iconBox: "bg-[#293681] text-white group-hover:bg-[#4274D9] group-hover:text-white dark:bg-[#95CCDD] dark:text-[#293681]",
    badge: "bg-white text-[#293681] font-bold shadow-xs dark:bg-slate-800 dark:text-[#95CCDD]",
    title: "text-[#293681] dark:text-white",
    category: "text-[#293681]/80 dark:text-slate-300",
  },
  {
    // 2: Soft Sky Blue
    card: "bg-[#95CCDD]/40 border-[#95CCDD] text-[#293681] shadow-sm hover:shadow-md hover:border-[#4274D9] dark:bg-[#95CCDD]/20 dark:border-[#95CCDD]/40 dark:text-white",
    iconBox: "bg-[#4274D9] text-white group-hover:bg-[#293681] group-hover:text-[#95CCDD] dark:bg-[#4274D9] dark:text-white",
    badge: "bg-white text-[#293681] font-bold shadow-xs dark:bg-slate-800 dark:text-[#95CCDD]",
    title: "text-[#293681] dark:text-white",
    category: "text-[#293681]/80 dark:text-slate-300",
  },
  {
    // 3: Electric Royal Blue
    card: "bg-[#4274D9] text-white border-[#4274D9] shadow-sm hover:shadow-md hover:border-[#95CCDD] dark:bg-[#4274D9]/90 dark:border-[#4274D9]",
    iconBox: "bg-white text-[#4274D9] group-hover:bg-[#293681] group-hover:text-white dark:bg-white dark:text-[#4274D9]",
    badge: "bg-white/20 text-white font-bold",
    title: "text-white",
    category: "text-[#D0E7E6]",
  },
  {
    // 4: Fresh Mint Aqua
    card: "bg-[#D0E7E6]/65 border-[#95CCDD] text-[#293681] shadow-sm hover:shadow-md hover:border-[#4274D9] dark:bg-[#D0E7E6]/15 dark:border-[#95CCDD]/30 dark:text-white",
    iconBox: "bg-[#4274D9] text-white group-hover:bg-[#293681] group-hover:text-[#95CCDD]",
    badge: "bg-white text-[#293681] font-bold shadow-xs dark:bg-slate-800 dark:text-[#95CCDD]",
    title: "text-[#293681] dark:text-white",
    category: "text-[#293681]/80 dark:text-slate-300",
  },
  {
    // 5: Deep Royal Navy
    card: "bg-[#293681] text-white border-[#293681] shadow-sm hover:shadow-md hover:border-[#95CCDD] dark:bg-[#293681] dark:border-[#4274D9]/50",
    iconBox: "bg-[#4274D9] text-white group-hover:bg-[#95CCDD] group-hover:text-[#293681]",
    badge: "bg-[#95CCDD] text-[#293681] font-extrabold",
    title: "text-white",
    category: "text-[#95CCDD]",
  },
  {
    // 6: Sky Azure
    card: "bg-[#95CCDD]/50 border-[#95CCDD] text-[#293681] shadow-sm hover:shadow-md hover:border-[#4274D9] dark:bg-[#95CCDD]/25 dark:border-[#95CCDD]/40 dark:text-white",
    iconBox: "bg-[#293681] text-[#95CCDD] group-hover:bg-[#4274D9] group-hover:text-white",
    badge: "bg-white text-[#293681] font-bold shadow-xs dark:bg-slate-800 dark:text-[#95CCDD]",
    title: "text-[#293681] dark:text-white",
    category: "text-[#293681]/80 dark:text-slate-300",
  },
  {
    // 7: Electric Accent Light
    card: "bg-[#4274D9]/15 border-2 border-[#4274D9] text-[#293681] shadow-sm hover:shadow-md hover:bg-[#4274D9]/25 dark:bg-[#4274D9]/25 dark:border-[#4274D9] dark:text-white",
    iconBox: "bg-[#4274D9] text-white group-hover:bg-[#293681] group-hover:text-white",
    badge: "bg-[#293681] text-white font-bold dark:bg-[#95CCDD] dark:text-[#293681]",
    title: "text-[#293681] dark:text-white",
    category: "text-[#293681]/80 dark:text-slate-300",
  },
];

export function Technologies() {
  const doubled = [...TECH_STACK, ...TECH_STACK];

  return (
    <section className="border-y border-slate-200/80 bg-slate-50/50 py-16 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="container">
        <Reveal>
          <p className="mb-8 text-center text-sm font-extrabold uppercase tracking-widest text-[#293681] dark:text-[#95CCDD]">
            Technologies we ship with
          </p>
        </Reveal>

        {/* Colorful Brand Palette Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {STACK_GRID.map((item, i) => {
            const Icon = item.icon;
            const theme = CARD_THEMES[i % CARD_THEMES.length];
            return (
              <Reveal key={item.name} delay={i * 0.04}>
                <div
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 ${theme.card}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${theme.iconBox}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] ${theme.badge}`}>
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm leading-tight ${theme.title}`}>{item.name}</h4>
                    <p className={`mt-1 text-xs ${theme.category}`}>{item.category}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Continuous Marquee Ribbon */}
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] pt-2">
          <div className="flex w-max animate-marquee gap-3">
            {doubled.map((tech, i) => (
              <span
                key={`${tech}-${i}`}
                className="whitespace-nowrap rounded-full border border-slate-200/80 bg-white/90 px-4 py-1.5 text-xs font-bold text-[#293681] shadow-sm backdrop-blur transition-colors hover:border-[#4274D9] hover:bg-[#D0E7E6]/40 hover:text-[#4274D9] dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
