import type { Metadata } from "next";
import { CheckCircle2, Rocket, Target, Users } from "lucide-react";
import { getHomeBundle, getSeoForPage } from "@/lib/server";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { ProcessTimeline } from "@/components/site/home/process";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { CtaSection } from "@/components/site/home/cta";
import { NewsletterSection } from "@/components/site/newsletter-section";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPage("about");
  return {
    title: seo?.title || "About Us",
    description: seo?.description || "C2D Tech — a developer friends squad in Trichy taking products from concept to deploy.",
    keywords: seo?.keywords,
    alternates: { canonical: "/about" },
  };
}

const VALUES = [
  { icon: Rocket, title: "Ship fast", description: "We move quickly with clean processes and relentless iteration." },
  { icon: Target, title: "Quality first", description: "Production-ready code, tested and monitored from day one." },
  { icon: Users, title: "Friendship built in", description: "We're a squad, not a vendor. You work directly with the builders." },
];

export default async function AboutPage() {
  const bundle = await getHomeBundle();
  const about = (bundle?.settings.about ?? {}) as Record<string, unknown>;
  const content = (about.content as string) || "";
  const points = (about.points as string[]) || [];
  const mission = (about.mission as string) || "";

  return (
    <>
      <AnalyticsTracker />
      <PageHeader
        eyebrow="About C2D Tech"
        title="Concept to Deploy, under one roof"
        description="We're a developer friends squad in Trichy — builders, designers and strategists who love shipping great software."
        crumb="About"
      />

      <section className="pb-20">
        <div className="container grid items-start gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="mb-3 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Our story
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight">What started as a squad, became a studio</h2>
            <div className="prose-cms mt-5 text-muted-foreground">
              {content.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </Reveal>
          <div>
            {mission && (
              <Reveal delay={0.1}>
                <div className="rounded-2xl border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold">Our mission</h3>
                  <p className="mt-2 text-muted-foreground">{mission}</p>
                </div>
              </Reveal>
            )}
            {points.length > 0 && (
              <Stagger className="mt-6 grid gap-4 sm:grid-cols-2">
                {points.map((point) => (
                  <StaggerItem key={point}>
                    <div className="flex h-full items-start gap-2 rounded-xl border bg-card p-4 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{point}</span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <Stagger className="grid gap-6 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <ProcessTimeline settings={bundle?.settings ?? {}} />
      <CtaSection />
      <NewsletterSection />
    </>
  );
}
