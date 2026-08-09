import type { Metadata } from "next";
import { getSeoForPage, getServices } from "@/lib/server";
import type { Service } from "@/types";
import { PageHeader } from "@/components/site/page-header";
import { ServiceCard } from "@/components/site/service-card";
import { Stagger } from "@/components/site/reveal";
import { CtaSection } from "@/components/site/home/cta";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { EmptyState } from "@/components/ui/empty-state";
import { NewsletterSection } from "@/components/site/newsletter-section";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPage("services");
  return {
    title: seo?.title || "Services",
    description: seo?.description || "Websites, mobile apps, AI automation, cloud & DevOps and digital marketing services from C2D Tech.",
    keywords: seo?.keywords,
    alternates: { canonical: "/services" },
  };
}

function ServicesGrid({ services }: { services: Service[] | null }) {
  if (!services?.length) {
    return <EmptyState title="Services coming soon" description="We're preparing our service catalog — check back shortly." />;
  }
  return (
    <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </Stagger>
  );
}

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <AnalyticsTracker />
      <PageHeader
        eyebrow="Our services"
        title="Services that take you from concept to deploy"
        description="Full-stack digital product engineering — strategy, design, development and everything after launch."
        crumb="Services"
      />
      <section className="pb-20">
        <div className="container">
          <ServicesGrid services={services} />
        </div>
      </section>
      <CtaSection />
      <NewsletterSection />
    </>
  );
}
