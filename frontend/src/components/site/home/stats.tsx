"use client";

import { motion } from "framer-motion";
import type { PublicSettings } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";

export function StatsSection({ settings }: { settings: PublicSettings }) {
  const items = (settings.statistics?.items as unknown as { label: string; value: number; suffix?: string }[] | undefined) ?? [];
  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-16 bg-[#D0E7E6]/20 dark:bg-slate-900/40">
      <div className="container">
        <SectionHeading eyebrow="By the numbers" title="We measure what matters" />
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all"
              >
                <div className="font-display text-4xl font-extrabold text-[#293681] dark:text-[#95CCDD]">
                  <span>{item.value.toLocaleString("en-IN")}</span>
                  {item.suffix && <span className="text-2xl text-[#4274D9]">{item.suffix}</span>}
                </div>
                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
