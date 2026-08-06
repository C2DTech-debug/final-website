import type { Metadata } from "next";
import { getHomeBundle, getSeoForPage } from "@/lib/server";
import { PageHeader } from "@/components/site/page-header";
import { ContactForm } from "@/components/site/contact-form";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { NewsletterSection } from "@/components/site/newsletter-section";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPage("contact");
  return {
    title: seo?.title || "Contact Us",
    description: seo?.description || "Get in touch with C2D Tech — we reply within 24 hours.",
    keywords: seo?.keywords,
  };
}

export default async function ContactPage() {
  const bundle = await getHomeBundle();
  const contact = (bundle?.settings.contact ?? {}) as Record<string, unknown>;

  return (
    <>
      <AnalyticsTracker />
      <PageHeader
        eyebrow="Contact"
        title="Let's build something together"
        description="Tell us about your project. We'll get back to you within 24 hours."
        crumb="Contact"
      />
      <section className="pb-24">
        <div className="container grid gap-10 lg:grid-cols-5">
          <div className="rounded-2xl border bg-card p-6 md:p-8 lg:col-span-3">
            <ContactForm />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Reach us directly</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {(contact.email as string) && (
                  <div className="flex justify-between gap-4 border-b pb-3">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd><a href={`mailto:${contact.email}`} className="font-medium hover:text-primary">{contact.email as string}</a></dd>
                  </div>
                )}
                {(contact.phone as string) && (
                  <div className="flex justify-between gap-4 border-b pb-3">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd><a href={`tel:${contact.phone}`} className="font-medium hover:text-primary">{contact.phone as string}</a></dd>
                  </div>
                )}
                {(contact.address as string) && (
                  <div className="flex justify-between gap-4 border-b pb-3">
                    <dt className="text-muted-foreground">Address</dt>
                    <dd className="text-right font-medium">{contact.address as string}</dd>
                  </div>
                )}
                {(contact.hours as string) && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Hours</dt>
                    <dd className="text-right font-medium">{contact.hours as string}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </section>
      <NewsletterSection />
    </>
  );
}
