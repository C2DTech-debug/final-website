"use client";

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
          title={(process.heading as string) || "The Concept to Deploy Process"}
          description={process.description as string}
          className="mb-8 md:mb-12"
        />
        <div className="relative">
          {/* Desktop connecting line */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-0.5 bg-[#95CCDD] lg:block opacity-70"
          />
          <ol className="grid gap-x-6 gap-y-7 md:grid-cols-3 lg:grid-cols-6">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={Math.min(i * 0.05, 0.25)}>
                <li className="relative flex gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
                  {/* Mobile vertical connector between steps */}
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-6 top-12 -bottom-2 w-0.5 bg-[#95CCDD] opacity-70 md:hidden"
                    />
                  )}
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#293681] font-display text-sm font-bold text-white shadow-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 pb-1 lg:mt-5 lg:px-1">
                    <h3 className="font-display text-base font-bold text-slate-900 leading-snug dark:text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.description}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
