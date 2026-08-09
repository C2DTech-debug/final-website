import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { getJobs, getSeoForPage } from "@/lib/server";
import type { Job } from "@/types";
import { PageHeader } from "@/components/site/page-header";
import { Stagger, StaggerItem } from "@/components/site/reveal";
import { CtaSection } from "@/components/site/home/cta";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { EmptyState } from "@/components/ui/empty-state";
import { NewsletterSection } from "@/components/site/newsletter-section";
import { JOB_TYPE_LABELS } from "@/types";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPage("careers");
  return {
    title: seo?.title || "Careers — C2D Tech",
    description: seo?.description || "Join the C2D Tech developer friends squad. Open roles across engineering, design and marketing.",
    keywords: seo?.keywords,
    alternates: { canonical: "/careers" },
  };
}

export default async function CareersPage() {
  const result = await getJobs();
  const jobs = result?.data ?? [];
  const departments = result?.departments ?? [];

  return (
    <>
      <AnalyticsTracker />
      <PageHeader
        eyebrow="Careers"
        title="Build with a friends squad"
        description="We're a small team of developers who love shipping real products. Come build the next big thing with us in Trichy — or from anywhere."
        crumb="Careers"
      />

      <section className="pb-20">
        <div className="container">
          {jobs.length === 0 ? (
            <EmptyState
              title="No open roles right now"
              description="We're not hiring at the moment, but we're always happy to meet great people. Send your profile to us anyway!"
              action={
                <Link href="/contact" className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                  Get in touch
                </Link>
              }
            />
          ) : (
            <Stagger className="mx-auto max-w-3xl space-y-4">
              {jobs.map((job: Job) => (
                <StaggerItem key={job._id}>
                  <Link
                    href={`/careers/${job.slug}`}
                    className="group flex flex-col gap-4 rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-semibold">{job.title}</h2>
                        {job.featured && (
                          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job.department} · {JOB_TYPE_LABELS[job.type] ?? job.type}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {job.location}
                        </span>
                        {job.experience && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {job.experience}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        View role
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors group-hover:border-primary/50">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <div className="rounded-3xl border bg-card p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl font-bold">Don't see the right role?</h2>
                <p className="mt-3 text-muted-foreground">
                  We're always looking for curious engineers, designers and marketers. Send us your portfolio and a note
                  about what you'd love to work on.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3">
                {departments.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    We're currently hiring across: {departments.join(", ")}.
                  </p>
                )}
                <Link
                  href="/contact"
                  className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Start the conversation <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
      <NewsletterSection />
    </>
  );
}
