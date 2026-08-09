import type { Metadata } from "next";
import { getSeoForPage, getTeam } from "@/lib/server";
import type { TeamMember } from "@/types";
import { PageHeader } from "@/components/site/page-header";
import { TeamCard } from "@/components/site/team-card";
import { Stagger } from "@/components/site/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { CtaSection } from "@/components/site/home/cta";
import { NewsletterSection } from "@/components/site/newsletter-section";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPage("team");
  return {
    title: seo?.title || "Our Team",
    description: seo?.description || "Meet the developer friends squad at C2D Tech in Trichy.",
    keywords: seo?.keywords,
    alternates: { canonical: "/team" },
  };
}

function TeamGrid({ members }: { members: TeamMember[] | null }) {
  if (!members?.length) {
    return <EmptyState title="Team members coming soon" description="We're growing — check back shortly." />;
  }
  return (
    <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((member) => (
        <TeamCard key={member._id} member={member} />
      ))}
    </Stagger>
  );
}

export default async function TeamPage() {
  const members = await getTeam();
  return (
    <>
      <AnalyticsTracker />
      <PageHeader
        eyebrow="The squad"
        title="The developer friends behind C2D Tech"
        description="Engineers, designers and product minds based in Trichy — building together, shipping together."
        crumb="Team"
      />
      <section className="pb-24">
        <div className="container">
          <TeamGrid members={members} />
        </div>
      </section>
      <CtaSection />
      <NewsletterSection />
    </>
  );
}
