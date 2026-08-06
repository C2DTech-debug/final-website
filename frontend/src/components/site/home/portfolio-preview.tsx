"use client";

import Link from "next/link";
import type { PortfolioProject } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { PortfolioCard } from "@/components/site/portfolio-card";
import { Stagger } from "@/components/site/reveal";

export function PortfolioPreview({ projects }: { projects: PortfolioProject[] }) {
  if (projects.length === 0) return null;
  const preview = projects.slice(0, 6);

  return (
    <section className="section-pad">
      <div className="container">
        <SectionHeading
          eyebrow="Our work"
          title="Projects we're proud of"
          description="Real products, real outcomes. A peek at what the squad ships."
        />
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {preview.map((project) => (
            <PortfolioCard key={project._id} project={project} />
          ))}
        </Stagger>
        <div className="mt-12 text-center">
          <Link href="/portfolio" className="text-sm font-medium text-primary hover:underline">
            View full portfolio →
          </Link>
        </div>
      </div>
    </section>
  );
}
