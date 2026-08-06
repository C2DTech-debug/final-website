import type { Metadata } from "next";
import Link from "next/link";
import { getBlogs, getSeoForPage } from "@/lib/server";
import type { Blog } from "@/types";
import { PageHeader } from "@/components/site/page-header";
import { BlogCard } from "@/components/site/blog-card";
import { Stagger } from "@/components/site/reveal";
import { CtaSection } from "@/components/site/home/cta";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { EmptyState } from "@/components/ui/empty-state";
import { NewsletterSection } from "@/components/site/newsletter-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoForPage("blog");
  return {
    title: seo?.title || "Blog — C2D Tech",
    description: seo?.description || "Engineering insights, product stories and tech tips from the C2D Tech friends squad.",
    keywords: seo?.keywords,
  };
}

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function BlogsPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category || "All";
  const page = Math.max(1, Number(params.page) || 1);

  const result = await getBlogs({ page, category });
  const posts = result?.data ?? [];
  const meta = result?.meta;
  const categories = meta?.categories ?? [];

  return (
    <>
      <AnalyticsTracker />
      <PageHeader
        eyebrow="Insights"
        title="From the C2D Tech blog"
        description="Notes on software engineering, product thinking and shipping real products from concept to deploy."
        crumb="Blog"
      />

      <section className="pb-20">
        <div className="container">
          {categories.length > 0 && (
            <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/blogs"
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === "All"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary/50"
                }`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/blogs?category=${encodeURIComponent(c)}`}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    category === c ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}

          {posts.length === 0 ? (
            <EmptyState
              title="No posts here yet"
              description="We're still writing. Check back soon for fresh insights and product stories."
            />
          ) : (
            <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: Blog) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </Stagger>
          )}

          {meta && meta.pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  href={`/blogs?page=${page - 1}${category !== "All" ? `&category=${encodeURIComponent(category)}` : ""}`}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/50"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.pages}
              </span>
              {page < meta.pages && (
                <Link
                  href={`/blogs?page=${page + 1}${category !== "All" ? `&category=${encodeURIComponent(category)}` : ""}`}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/50"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <CtaSection />
      <NewsletterSection />
    </>
  );
}
