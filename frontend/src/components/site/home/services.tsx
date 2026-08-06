"use client";

import Link from "next/link";
import type { Service } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { Stagger } from "@/components/site/reveal";

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section className="section-pad bg-muted/30">
      <div className="container">
        <SectionHeading
          eyebrow="What we do"
          title="Services built for scale"
          description="From websites to AI automation, we take your idea from concept to a deployed, production-ready product."
        />
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </Stagger>
        <div className="mt-12 text-center">
          <Link href="/services" className="text-sm font-medium text-primary hover:underline">
            View all services →
          </Link>
        </div>
      </div>
    </section>
  );
}
