"use client";

import { motion } from "framer-motion";
import type { PublicSettings } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";

export function ProcessTimeline({ settings }: { settings: PublicSettings }) {
  const process = (settings.process ?? {}) as Record<string, unknown>;
  const steps = (process.steps as { title: string; description: string }[] | undefined) ?? [];
  if (steps.length === 0) return null;

  return (
    <section className="section-pad bg-muted/30">
      <div className="container">
        <SectionHeading
          eyebrow="How we work"
          title={(process.heading as string) || "From concept to deploy"}
          description={process.description as string}
        />
        <div className="relative">
          <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 lg:block" />
          <div className="grid gap-8 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1} className="relative">
                <div className="flex lg:flex-col">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 font-display text-lg font-bold text-white shadow-lg shadow-primary/30"
                  >
                    {i + 1}
                  </motion.div>
                  <div className="mt-4 lg:mt-6">
                    <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
