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
                whileHover={{ y: -4 }}
                className="h-full rounded-2xl border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{point.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{point.description}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
