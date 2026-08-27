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
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">{heading}</h2>
          <div className="prose-cms mt-5 text-slate-600 dark:text-slate-300">
            {content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {points.length > 0 && (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4274D9]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal delay={0.15} className="relative">
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-muted shadow-sm dark:border-slate-800"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {about.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={about.image as string}
                alt={heading}
                loading="lazy"
                decoding="async"
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#293681]">
                <p className="font-display text-2xl font-extrabold text-[#95CCDD]">C2D Tech Studio</p>
              </div>
            )}
          </motion.div>
          <div className="absolute -bottom-5 -right-3 hidden rounded-xl border border-slate-200/90 bg-white/95 p-5 shadow-lg backdrop-blur-sm sm:block dark:border-slate-800 dark:bg-slate-900/95">
            <p className="font-display text-3xl font-extrabold text-[#293681] dark:text-[#95CCDD]">{(about.expYears as string) || "5+"}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Years of engineering experience</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
