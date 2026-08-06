"use client";

import Link from "next/link";
import type { TeamMember } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { TeamCard } from "@/components/site/team-card";
import { Stagger } from "@/components/site/reveal";

export function TeamPreview({ team }: { team: TeamMember[] }) {
  if (team.length === 0) return null;
  const preview = team.slice(0, 4);

  return (
    <section className="section-pad bg-muted/30">
      <div className="container">
        <SectionHeading
          eyebrow="The squad"
          title="Developer friends, together"
          description="A tight-knit team of engineers, designers and strategists in Trichy."
        />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {preview.map((member) => (
            <TeamCard key={member._id} member={member} />
          ))}
        </Stagger>
        <div className="mt-12 text-center">
          <Link href="/team" className="text-sm font-medium text-primary hover:underline">
            Meet the whole team →
          </Link>
        </div>
      </div>
    </section>
  );
}
