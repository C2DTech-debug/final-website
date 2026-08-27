"use client";

import Link from "next/link";
import type { TeamMember } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { TeamAccordion } from "@/components/site/team-accordion";

export function TeamPreview({ team }: { team: TeamMember[] }) {
  if (team.length === 0) return null;
  const preview = team.slice(0, 4);

  return (
    <section className="section-pad bg-muted/30">
      <div className="container max-w-6xl">
        <SectionHeading
          eyebrow="The squad"
          title="Developer friends, together"
          description="A tight-knit team of engineers, designers and strategists in Trichy."
        />
        <TeamAccordion members={preview} />
        <div className="mt-12 text-center">
          <Link href="/team" className="text-sm font-semibold text-[#4274D9] hover:underline">
            Meet the whole team →
          </Link>
        </div>
      </div>
    </section>
  );
}
