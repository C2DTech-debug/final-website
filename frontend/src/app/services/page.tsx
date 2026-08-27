import type { Metadata } from "next";
import { getSeoForPage, getServices } from "@/lib/server";
import type { Service } from "@/types";
import { PageHeader } from "@/components/site/page-header";
import { ServiceCard } from "@/components/site/service-card";
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

  // Chunks of 3 for desktop rows
  const chunks: Service[][] = [];
  for (let i = 0; i < services.length; i += 3) {
    chunks.push(services.slice(i, i + 3));
  }

  return (
    <div className="pt-6 pb-12">
      {/* Desktop Sticky Stacking Rows (>= md) */}
      <div className="hidden md:flex flex-col gap-10">
        {chunks.map((chunk, rowIndex) => {
          const stickyTop = 112 + rowIndex * 16;
          const zIndex = (rowIndex + 1) * 10;

          return (
            <div
              key={rowIndex}
              style={{
                top: `${stickyTop}px`,
                zIndex: zIndex,
              }}
              className="sticky grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-all duration-300"
            >
              {chunk.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          );
        })}
      </div>

      {/* Mobile Sticky Stacking Cards (< md) */}
      <div className="relative flex md:hidden flex-col gap-8 pb-8">
        {services.map((service, index) => {
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
    </div>
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
      <section className="pt-4 pb-24">
        <div className="container">
          <ServicesGrid services={services} />
        </div>
      </section>
      <CtaSection />
      <NewsletterSection />
    </>
  );
}
