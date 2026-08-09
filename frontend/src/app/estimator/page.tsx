import type { Metadata } from "next";
import { getSeoForPage } from "@/lib/server";
import { PageHeader } from "@/components/site/page-header";
import { EstimatorForm } from "@/components/site/estimator-form";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { NewsletterSection } from "@/components/site/newsletter-section";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPage("estimator");
  return {
    title: seo?.title || "Project Estimator",
    description: seo?.description || "Get an instant estimate for your software project in under a minute.",
    keywords: seo?.keywords,
    alternates: { canonical: "/estimator" },
  };
}

export default function EstimatorPage() {
  return (
    <>
      <AnalyticsTracker />
      <PageHeader
        eyebrow="Project estimator"
        title="Estimate your project in seconds"
        description="Pick your services and add-ons to get an instant, transparent cost and timeline estimate."
        crumb="Estimator"
      />
      <section className="pb-24">
        <div className="container">
          <EstimatorForm />
        </div>
      </section>
      <NewsletterSection />
    </>
  );
}
