"use client";

import Link from "next/link";
import type { Service } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";

export function ServicesSection({ services }: { services: Service[] }) {
  if (!services || services.length === 0) return null;

  const row1 = services.slice(0, 3);
  const row2 = services.slice(3, 6);

  return (
    <section className="section-pad bg-muted/30">
      <div className="container max-w-6xl">
        <SectionHeading
          eyebrow="What we do"
          title="Services built for scale"
          description="From websites to AI automation, we take your idea from concept to a deployed, production-ready product."
        />

        {/* Desktop Sticky Stacking Rows (>= md) */}
        <div className="hidden md:flex flex-col gap-10">
          {/* Row 1: First 3 cards - Sticks near the top navbar */}
          <div className="sticky top-28 z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-all duration-300">
            {row1.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>

          {/* Row 2: Bottom 3 cards - Glides and stacks directly over Row 1 */}
          {row2.length > 0 && (
            <div className="sticky top-32 z-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-all duration-300">
              {row2.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </div>

        {/* Mobile Sticky Stacking Cards (< md) */}
        <div className="relative flex md:hidden flex-col gap-8 pb-8">
          {services.slice(0, 6).map((service, index) => {
            const stickyTop = 84 + index * 16;
            const zIndex = index + 10;

            return (
              <div
                key={service._id}
                style={{
                  top: `${stickyTop}px`,
                  zIndex: zIndex,
                }}
                className="sticky shadow-[0_-8px_30px_rgba(41,54,129,0.12)] rounded-[28px] transition-all duration-300"
              >
                <ServiceCard service={service} />
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link href="/services" className="text-sm font-bold text-[#4274D9] hover:underline">
            View all services →
          </Link>
        </div>
      </div>
    </section>
  );
}
