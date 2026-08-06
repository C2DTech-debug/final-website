import type { Metadata } from "next";
import Link from "next/link";
import { getBlogs, getJobs, getSeoForPage, getServices } from "@/lib/server";
import { PageHeader } from "@/components/site/page-header";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { NewsletterSection } from "@/components/site/newsletter-section";
import { NAV_LINKS } from "@/constants";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPage("sitemap");
  return {
    title: seo?.title || "Sitemap — C2D Tech",
    description: seo?.description || "Browse all pages, services, portfolio projects, blog posts and job openings at C2D Tech.",
  };
}

function Group({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function SitemapPage() {
  const [services, blogs, jobs] = await Promise.all([getServices(), getBlogs({}), getJobs()]);

  return (
    <>
      <AnalyticsTracker />
      <PageHeader eyebrow="Sitemap" title="Everything on C2D Tech" description="A quick index of every page on our site." crumb="Sitemap" />

      <section className="pb-20">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Group
              title="Pages"
              links={[
                ...NAV_LINKS.map((l) => ({ href: l.href, label: l.label })),
                { href: "/estimator", label: "Project Estimator" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/cookies", label: "Cookie Policy" },
              ]}
            />
            <Group
              title="Services"
              links={(services ?? []).map((s) => ({ href: `/services/${s.slug}`, label: s.name }))}
            />
            <Group
              title="Blog"
              links={(blogs?.data ?? []).map((b) => ({ href: `/blogs/${b.slug}`, label: b.title }))}
            />
            <Group
              title="Careers"
              links={(jobs?.data ?? []).map((j) => ({ href: `/careers/${j.slug}`, label: j.title }))}
            />
          </div>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}
