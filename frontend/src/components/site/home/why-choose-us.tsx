"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { PublicSettings } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";

export function WhyChooseUs({ settings }: { settings: PublicSettings }) {
  const why = (settings.whyChooseUs ?? {}) as Record<string, unknown>;
  const points = (why.points as { title: string; description: string }[] | undefined) ?? [];
  if (points.length === 0) return null;

  return (
    <section className="section-pad">
      <div className="container">
        <SectionHeading
          eyebrow="Why choose us"
          title={(why.heading as string) || "Why teams choose C2D Tech"}
          description={why.description as string}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {points.map((point, i) => (
            <Reveal key={point.title} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -6 }}
                className="h-full rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-[0_10px_30px_rgba(41,54,129,0.04)] transition-all duration-300 hover:border-[#4274D9]/40 hover:shadow-[0_20px_40px_rgba(41,54,129,0.1)] dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none dark:hover:border-[#4274D9]/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D0E7E6]/40 text-[#4274D9] shadow-sm dark:bg-[#4274D9]/15 dark:text-[#95CCDD]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{point.description}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
