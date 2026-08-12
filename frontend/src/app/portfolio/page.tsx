import type { Metadata } from "next";
import { getPortfolio, getSeoForPage } from "@/lib/server";
import { PageHeader } from "@/components/site/page-header";
import { PortfolioBrowser } from "@/components/site/portfolio-browser";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { CtaSection } from "@/components/site/home/cta";
import { NewsletterSection } from "@/components/site/newsletter-section";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPage("portfolio");
  return {
    title: seo?.title || "Portfolio — C2D Tech",
    description:
      seo?.description ||
      "Explore selected web platforms and mobile apps deployed by C2D Tech for clients in Trichy and beyond.",
    keywords: seo?.keywords,
    alternates: { canonical: "/portfolio" },
  };
}

export default async function PortfolioPage() {
  const result = await getPortfolio();
  const projects = result?.data ?? [];
  const categories = result?.categories ?? [];

  return (
    <>
      <AnalyticsTracker />
      <PageHeader
        eyebrow="Our work"
        title="The C2D Tech portfolio"
        description="A selection of products we've designed, built and deployed. Search by technology or filter by category."
        crumb="Portfolio"
      />
      <section className="pb-24">
        <div className="container">
          <PortfolioBrowser initialProjects={projects} initialCategories={categories} />
        </div>
      </section>
      <CtaSection />
      <NewsletterSection />
    </>
  );
}
