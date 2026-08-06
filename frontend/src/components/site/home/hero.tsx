"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import type { PublicSettings } from "@/types";
import { Counter } from "@/components/site/counter";
import { ScrollDown } from "@/components/site/floating-actions";

export function HeroSection({ settings }: { settings: PublicSettings }) {
  const hero = (settings.hero ?? {}) as Record<string, unknown>;
  const stats = (settings.statistics?.items as unknown as { label: string; value: number; suffix?: string }[] | undefined) ?? [];

  const badge = (hero.badge as string) || "C2D Tech — Concept to Deploy";
  const title = (hero.title as string) || "We build digital products";
  const highlight = (hero.highlight as string) || "from concept to deploy";
  const subtitle =
    (hero.subtitle as string) ||
    "A developer friends squad in Trichy crafting premium websites, mobile apps, AI automation and cloud solutions for ambitious businesses.";

  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      <div className="absolute right-[-10%] top-1/4 -z-10 h-[300px] w-[300px] animate-float rounded-full bg-fuchsia-500/20 blur-[100px]" />
      <div className="absolute left-[-8%] top-2/3 -z-10 h-[280px] w-[280px] animate-float rounded-full bg-cyan-500/20 blur-[100px] [animation-delay:2s]" />

      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              {badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {title} <span className="text-gradient">{highlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href={(hero.ctaPrimaryHref as string) || "/estimator"}
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
            >
              {(hero.ctaPrimaryLabel as string) || "Start Your Project"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={(hero.ctaSecondaryHref as string) || "/portfolio"}
              className="glass inline-flex h-12 items-center gap-2 rounded-xl px-8 text-base font-medium transition-colors hover:text-primary"
            >
              <Play className="h-4 w-4" />
              {(hero.ctaSecondaryLabel as string) || "See Our Work"}
            </Link>
          </motion.div>

          {stats.length > 0 && (
            <motion.dl
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
            >
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <dt className="order-2 mt-1 text-sm text-muted-foreground">{s.label}</dt>
                  <dd className="font-display text-3xl font-bold text-gradient md:text-4xl">
                    <Counter value={s.value} suffix={s.suffix ?? "+"} />
                  </dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>

        <ScrollDown className="mt-16" />
      </div>
    </section>
  );
}
