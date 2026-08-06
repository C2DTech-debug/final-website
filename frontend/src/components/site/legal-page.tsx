import { PageHeader } from "@/components/site/page-header";
import { NewsletterSection } from "@/components/site/newsletter-section";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";

interface LegalPageProps {
  title: string;
  updated?: string;
  sections: { heading: string; body: string }[];
  crumb: string;
}

export function LegalPage({ title, updated = "August 2026", sections, crumb }: LegalPageProps) {
  return (
    <>
      <AnalyticsTracker />
      <PageHeader title={title} description={`Last updated: ${updated}`} crumb={crumb} />
      <section className="pb-24">
        <div className="container max-w-3xl space-y-8">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-display text-xl font-semibold">{section.heading}</h2>
              <div className="prose-cms mt-3 text-muted-foreground">{section.body}</div>
            </div>
          ))}
        </div>
      </section>
      <NewsletterSection />
    </>
  );
}
