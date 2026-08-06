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
              <div className="relative flex h-full flex-col rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                <h3 className="font-display text-lg font-semibold">{service.name}</h3>
                <div className="mt-4">
                  <span className="font-display text-4xl font-bold text-gradient">
                    {formatINR(service.pricing!.startingAt!)}
                  </span>
                  <span className="text-sm text-muted-foreground"> / project</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {(service.features || []).slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
