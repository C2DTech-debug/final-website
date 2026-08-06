"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { PublicSettings } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";

export function IntroSection({ settings }: { settings: PublicSettings }) {
  const about = (settings.about ?? {}) as Record<string, unknown>;
  const content = (about.content as string) || "";
  const points = (about.points as string[]) || [];
  const heading = (about.heading as string) || "Concept to Deploy — one squad";
  const eyebrow = (about.eyebrow as string) || "Who we are";

  return (
    <section className="section-pad">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="mb-3 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
          <div className="prose-cms mt-5 text-muted-foreground">
            {content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {points.length > 0 && (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal delay={0.15} className="relative">
          <motion.div
            className="relative overflow-hidden rounded-3xl border bg-muted"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {about.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={about.image as string} alt={heading} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-cyan-500/30" />
            )}
          </motion.div>
          <div className="glass-strong absolute -bottom-6 -right-4 hidden rounded-2xl p-5 sm:block">
            <p className="font-display text-3xl font-bold text-gradient">{about.expYears as string || "5+"}</p>
            <p className="text-xs text-muted-foreground">Years of experience</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
