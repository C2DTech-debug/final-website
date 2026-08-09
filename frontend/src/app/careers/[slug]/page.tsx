import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Briefcase, Clock, MapPin } from "lucide-react";
import { getJobBySlug, getJobs } from "@/lib/server";
import { Reveal } from "@/components/site/reveal";
import { ApplyForm } from "@/components/site/apply-form";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { CtaSection } from "@/components/site/home/cta";
import { NewsletterSection } from "@/components/site/newsletter-section";
import { JOB_TYPE_LABELS } from "@/types";

export const revalidate = 300;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const jobs = await getJobs();
  return jobs?.data.map((j) => ({ slug: j.slug })) ?? [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  return {
    title: job.seo?.title || `${job.title} — Careers at C2D Tech`,
    description: job.seo?.description || job.description?.slice(0, 160),
    alternates: { canonical: `/careers/${slug}` },
  };
}

export default async function JobDetailsPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) redirect("/careers");

  return (
    <>
      <AnalyticsTracker />
      <section className="relative overflow-hidden pb-12 pt-32">
        <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="container">
          <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/careers" className="hover:text-primary">Careers</Link>
            <span>/</span>
            <span className="text-foreground">{job.title}</span>
          </nav>
          <Reveal>
            <Link href="/careers" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> All roles
            </Link>
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {job.department}
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">{job.title}</h1>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> {JOB_TYPE_LABELS[job.type] ?? job.type}
              </span>
              {job.experience && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {job.experience}
                </span>
              )}
            </div>
            {job.salary && <p className="mt-4 text-lg font-semibold text-primary">{job.salary}</p>}
          </Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="container grid gap-10 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-3">
            {job.description && (
              <Reveal>
                <div className="prose-cms text-muted-foreground">
                  {job.description.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </Reveal>
            )}

            {job.responsibilities.length > 0 && (
              <Reveal>
                <h2 className="font-display text-xl font-semibold">What you'll do</h2>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {job.requirements.length > 0 && (
              <Reveal>
                <h2 className="font-display text-xl font-semibold">What we're looking for</h2>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {job.benefits.length > 0 && (
              <Reveal>
                <h2 className="font-display text-xl font-semibold">Perks & benefits</h2>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  {job.benefits.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          <aside className="lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-semibold">Apply for this role</h2>
              <p className="mb-5 mt-1 text-sm text-muted-foreground">
                Attach your resume and tell us why you'd be a great addition to the squad.
              </p>
              <ApplyForm jobId={job._id} jobSlug={job.slug} jobTitle={job.title} />
            </div>
          </aside>
        </div>
      </section>

      <CtaSection />
      <NewsletterSection />
    </>
  );
}
