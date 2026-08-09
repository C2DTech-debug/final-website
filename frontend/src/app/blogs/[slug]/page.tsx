import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Eye, Tag } from "lucide-react";
import { getBlogBySlug, getBlogs } from "@/lib/server";
import type { Blog } from "@/types";
import { Reveal } from "@/components/site/reveal";
import { BlogCard } from "@/components/site/blog-card";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { CtaSection } from "@/components/site/home/cta";
import { NewsletterSection } from "@/components/site/newsletter-section";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const blogs = await getBlogs();
  return blogs?.data.map((b) => ({ slug: b.slug })) ?? [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) return {};
  return {
    title: post.seo?.title || `${post.title} — C2D Tech Blog`,
    description: post.seo?.description || post.excerpt,
    keywords: post.seo?.keywords,
    alternates: { canonical: `/blogs/${slug}` },
    openGraph: post.coverImage ? { images: [post.coverImage] } : undefined,
  };
}

export default async function BlogDetailsPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) redirect("/blogs");
  const related = post.related ?? [];

  return (
    <>
      <AnalyticsTracker />
      <article>
        <section className="relative overflow-hidden pb-12 pt-32">
          <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
          <div className="container">
            <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link href="/blogs" className="hover:text-primary">Blog</Link>
              <span>/</span>
              <span className="text-foreground">{post.title}</span>
            </nav>
            <Reveal>
              <Link
                href="/blogs"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" /> All posts
              </Link>
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                {post.category}
              </span>
              <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight md:text-5xl">{post.title}</h1>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/30 to-cyan-500/30 text-xs font-bold">
                    {post.authorName.slice(0, 2).toUpperCase()}
                  </span>
                  {post.authorName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {formatDate(post.publishedAt || post.createdAt)}
                </span>
                {post.readingTime > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {post.readingTime} min read
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> {post.views} views
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="pb-20">
          <div className="container">
            {post.coverImage && (
              <Reveal>
                <div className="mb-10 overflow-hidden rounded-3xl border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.coverImage} alt={post.title} className="aspect-[16/9] w-full object-cover" />
                </div>
              </Reveal>
            )}

            {post.excerpt && (
              <Reveal>
                <p className="mx-auto mb-8 max-w-3xl text-lg font-medium text-muted-foreground">{post.excerpt}</p>
              </Reveal>
            )}

            <div className="mx-auto max-w-3xl">
              <div className="prose-cms text-muted-foreground" dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {post.tags.length > 0 && (
              <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center gap-2 border-t pt-8">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blogs?category=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium transition-colors hover:bg-primary/15 hover:text-primary"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </article>

      {related.length > 0 && (
        <section className="pb-20">
          <div className="container">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Related posts</h2>
              <Link href="/blogs" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((post: Blog) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection />
      <NewsletterSection />
    </>
  );
}
