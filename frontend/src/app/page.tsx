import type { Metadata } from "next";
import { getHomeBundle } from "@/lib/server";
import { HeroSection } from "@/components/site/home/hero";
import { IntroSection } from "@/components/site/home/intro";
import { ServicesSection } from "@/components/site/home/services";
import { StatsSection } from "@/components/site/home/stats";
import { WhyChooseUs } from "@/components/site/home/why-choose-us";
import { ProcessTimeline } from "@/components/site/home/process";
import { PortfolioPreview } from "@/components/site/home/portfolio-preview";
import { TeamPreview } from "@/components/site/home/team-preview";
import { TestimonialsSection } from "@/components/site/home/testimonials";
import { Technologies } from "@/components/site/home/technologies";
import { PricingHighlights } from "@/components/site/home/pricing";
import { FaqSection } from "@/components/site/home/faq";
import { CtaSection } from "@/components/site/home/cta";
import { ContactSection } from "@/components/site/home/contact";
import { FloatingActions } from "@/components/site/floating-actions";
import { NewsletterSection } from "@/components/site/newsletter-section";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const bundle = await getHomeBundle();
  const seo = bundle?.seo;
  return {
    title: seo?.title || undefined,
    description: seo?.description || undefined,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: "/" },
    openGraph: seo?.ogTitle
      ? { title: seo.ogTitle, description: seo.ogDescription, images: seo.ogImage ? [seo.ogImage] : undefined }
      : undefined,
  };
}

export default async function HomePage() {
  const bundle = await getHomeBundle();
  const settings = bundle?.settings ?? {};
  const services = bundle?.services ?? [];
  const portfolio = bundle?.portfolio ?? [];
  const team = bundle?.team ?? [];
  const testimonials = bundle?.testimonials ?? [];
  const faqs = bundle?.faqs ?? [];

  return (
    <>
      <AnalyticsTracker />
      <HeroSection settings={settings} />
      <IntroSection settings={settings} />
      <StatsSection settings={settings} />
      <ServicesSection services={services} />
      <ProcessTimeline settings={settings} />
      <WhyChooseUs settings={settings} />
      <PortfolioPreview projects={portfolio} />
      <Technologies />
      <TeamPreview team={team} />
      <TestimonialsSection testimonials={testimonials} />
      <PricingHighlights services={services} />
      <FaqSection faqs={faqs} />
      <CtaSection />
      <ContactSection settings={settings} />
      <NewsletterSection />
      <FloatingActions />
    </>
  );
}
