import type { Metadata } from "next";
import { getSeoForPage, getTeam } from "@/lib/server";
import type { TeamMember } from "@/types";
import { PageHeader } from "@/components/site/page-header";
import { TeamAccordion } from "@/components/site/team-accordion";
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
        <div className="container max-w-6xl">
          {members && members.length > 0 ? (
            <TeamAccordion members={members} />
          ) : (
            <EmptyState title="Team members coming soon" description="We're growing — check back shortly." />
          )}
        </div>
      </section>
      <CtaSection />
      <NewsletterSection />
    </>
  );
}
