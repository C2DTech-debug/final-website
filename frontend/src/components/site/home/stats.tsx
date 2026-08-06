"use client";

import { motion } from "framer-motion";
import type { PublicSettings } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";

export function StatsSection({ settings }: { settings: PublicSettings }) {
  const items = (settings.statistics?.items as unknown as { label: string; value: number; suffix?: string }[] | undefined) ?? [];
  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-600/10 via-fuchsia-500/10 to-cyan-500/10" />
      <div className="container">
        <SectionHeading eyebrow="By the numbers" title="We measure what matters" />
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="font-display text-4xl font-bold text-gradient">
                  <span>{item.value.toLocaleString("en-IN")}</span>
                  {item.suffix && <span className="text-2xl">{item.suffix}</span>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
