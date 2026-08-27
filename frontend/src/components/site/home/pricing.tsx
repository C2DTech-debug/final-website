"use client";

import { Check } from "lucide-react";
import type { Service } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { formatINR } from "@/lib/utils";

export function PricingHighlights({ services }: { services: Service[] }) {
  const withPricing = services.filter((s) => s.pricing?.enabled && (s.pricing.startingAt ?? 0) > 0);
  if (withPricing.length === 0) return null;
  const cards = withPricing.slice(0, 3);

  return (
    <section className="section-pad bg-muted/30">
      <div className="container">
        <SectionHeading
          eyebrow="Pricing highlights"
          title="Transparent starting prices"
          description="Every project is scoped with you — here's where most of our work starts."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((service, i) => (
            <Reveal key={service._id} delay={i * 0.08}>
              <div className="relative flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-[0_10px_30px_rgba(41,54,129,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#4274D9]/40 hover:shadow-[0_20px_40px_rgba(41,54,129,0.1)] dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none dark:hover:border-[#4274D9]/50">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">{service.name}</h3>
                <div className="mt-4">
                  <span className="font-display text-4xl font-extrabold text-[#293681] dark:text-[#95CCDD]">
                    {formatINR(service.pricing!.startingAt!)}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400"> / project</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 dark:border-slate-800/80 pt-6">
                  {(service.features || []).slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#D0E7E6]/60 text-[#4274D9] dark:bg-[#4274D9]/20 dark:text-[#95CCDD]">
                        <Check className="h-3 w-3" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
