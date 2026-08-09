import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, Package, Send } from "lucide-react";
import { getHomeBundle } from "@/lib/server";
import { formatINR } from "@/lib/utils";
import { ServiceIcon } from "@/components/site/service-icon";
import { Reveal } from "@/components/site/reveal";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { NewsletterSection } from "@/components/site/newsletter-section";

export const revalidate = 300;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const bundle = await getHomeBundle();
  return bundle?.services.map((s) => ({ slug: s.slug })) ?? [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getHomeBundle();
  const service = bundle?.services.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: service.seo?.title || `${service.name} — C2D Tech`,
    description: service.seo?.description || service.shortDescription || service.tagline,
    keywords: service.seo?.keywords,
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServiceDetailsPage({ params }: Props) {
  const { slug } = await params;
  const bundle = await getHomeBundle();
  const service = bundle?.services.find((s) => s.slug === slug);
  if (!service) redirect("/services");

  const related = bundle?.services.filter((s) => s.slug !== slug && s.category === service.category).slice(0, 3) ?? [];

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
            <Link href="/services" className="hover:text-primary">Services</Link>
            <span>/</span>
            <span className="text-foreground">{service.name}</span>
          </nav>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                {service.category}
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">{service.name}</h1>
              {service.tagline && <p className="mt-3 text-lg font-medium text-primary">{service.tagline}</p>}
              <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">{service.shortDescription}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/estimator"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105"
                >
                  Get a Quote <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border bg-background px-7 font-semibold transition-colors hover:border-primary/50"
                >
                  Talk to Us
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="relative overflow-hidden rounded-3xl border bg-muted">
                {service.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={service.image} alt={service.name} className="aspect-[16/10] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-cyan-500/30">
                    <ServiceIcon icon={service.icon} className="h-24 w-24 text-white/70" />
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container grid gap-10 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            {service.description && (
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">Overview</h2>
                <div className="prose-cms mt-4 text-muted-foreground">
                  {service.description.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </Reveal>
            )}

            {service.features.length > 0 && (
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">What's included</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 rounded-xl border bg-card p-4 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {service.deliverables.length > 0 && (
              <Reveal>
                <h2 className="font-display text-2xl font-semibold">Deliverables</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2 rounded-xl border bg-card p-4 text-sm">
                      <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          <div className="space-y-6">
            <Reveal>
              <div className="sticky top-24 rounded-2xl border bg-card p-6">
                <h3 className="font-display text-lg font-semibold">Quick estimate</h3>
                {service.pricing?.enabled && (service.pricing.startingAt ?? 0) > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {service.pricing.priceLabel || "Starting at"}
                    </p>
                    <p className="font-display text-4xl font-bold text-gradient">
                      {formatINR(service.pricing.startingAt ?? 0)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">Custom quote based on scope.</p>
                )}
                {service.pricing?.deliveryDays ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> Typical delivery {service.pricing.deliveryDays} days
                  </div>
                ) : null}
                <Link
                  href="/estimator"
                  className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Send className="h-4 w-4" /> Get exact estimate
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-20">
          <div className="container">
            <h2 className="mb-6 font-display text-2xl font-semibold">Related services</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((s) => (
                <Link key={s._id} href={`/services/${s.slug}`} className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40">
                  <ServiceIcon icon={s.icon} className="h-8 w-8 text-primary" />
                  <h3 className="mt-3 font-display font-semibold group-hover:text-primary">{s.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.shortDescription}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterSection />
    </>
  );
}
