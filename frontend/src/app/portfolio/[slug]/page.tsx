import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Github, Users, Calendar, Tag } from "lucide-react";
import { getHomeBundle } from "@/lib/server";
import { Reveal } from "@/components/site/reveal";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { CtaSection } from "@/components/site/home/cta";
import { NewsletterSection } from "@/components/site/newsletter-section";

export const revalidate = 300;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const bundle = await getHomeBundle();
  return bundle?.portfolio.map((p) => ({ slug: p.slug })) ?? [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getHomeBundle();
  const project = bundle?.portfolio.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — C2D Tech Portfolio`,
    description: project.shortDescription,
  };
}

export default async function PortfolioDetailsPage({ params }: Props) {
  const { slug } = await params;
  const bundle = await getHomeBundle();
  const project = bundle?.portfolio.find((p) => p.slug === slug);
  if (!project) redirect("/portfolio");

  return (
    <>
      <AnalyticsTracker />
      <section className="relative overflow-hidden pb-14 pt-32">
        <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-32 left-1/2 -z-10 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="container">
          <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/portfolio" className="hover:text-primary">Portfolio</Link>
            <span>/</span>
            <span className="text-foreground">{project.title}</span>
          </nav>
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {project.category}
            </span>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">{project.title}</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">{project.shortDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                  <ExternalLink className="h-4 w-4" /> Live Site
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg border px-5 text-sm font-semibold transition-colors hover:border-primary/50">
                  <Github className="h-4 w-4" /> Source Code
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border bg-muted">
              {project.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.coverImage} alt={project.title} className="aspect-[16/9] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-cyan-500/30 text-4xl font-bold text-white">
                  {project.title.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </Reveal>

          {project.gallery.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {project.gallery.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img} alt={`${project.title} screenshot ${i + 1}`} className="aspect-video w-full rounded-2xl border object-cover" />
              ))}
            </div>
          )}

          <div className="mt-12 grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-semibold">About the project</h2>
              <div className="prose-cms mt-4 text-muted-foreground">
                {project.description.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {project.technologies.length > 0 && (
                <>
                  <h2 className="mt-10 font-display text-2xl font-semibold">Technologies</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="glass rounded-full px-4 py-1.5 text-sm font-medium">{tech}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border bg-card p-6">
                <h3 className="font-display text-lg font-semibold">Project details</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {project.client && (
                    <div className="flex justify-between gap-4 border-b pb-3">
                      <dt className="text-muted-foreground">Client</dt>
                      <dd className="font-medium">{project.client}</dd>
                    </div>
                  )}
                  {project.year && (
                    <div className="flex justify-between gap-4 border-b pb-3">
                      <dt className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> Year</dt>
                      <dd className="font-medium">{project.year}</dd>
                    </div>
                  )}
                  {project.role && (
                    <div className="flex justify-between gap-4 border-b pb-3">
                      <dt className="flex items-center gap-2 text-muted-foreground"><Users className="h-3.5 w-3.5" /> Our role</dt>
                      <dd className="font-medium">{project.role}</dd>
                    </div>
                  )}
                  {project.tags.length > 0 && (
                    <div>
                      <dt className="mb-2 flex items-center gap-2 text-muted-foreground"><Tag className="h-3.5 w-3.5" /> Tags</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{tag}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="rounded-2xl border bg-card p-6 text-center">
                <p className="font-display text-lg font-semibold">Want something like this?</p>
                <Link href="/contact" className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                  Start a project
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CtaSection />
      <NewsletterSection />
    </>
  );
}
