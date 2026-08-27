"use client";

import { useState, useEffect } from "react";
import type { Blog } from "@/types";
import { PageHeader } from "@/components/site/page-header";
import { BlogCard } from "@/components/site/blog-card";
import { Stagger } from "@/components/site/reveal";
import { CtaSection } from "@/components/site/home/cta";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { EmptyState } from "@/components/ui/empty-state";
import { NewsletterSection } from "@/components/site/newsletter-section";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowDown } from "lucide-react";

export default function BlogsPage() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/v1/public/blogs?page=1&limit=6`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          setPosts(json.data);
          setHasMore(1 < (json.meta?.pages ?? 1));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/v1/public/blogs?page=${nextPage}&limit=6`);
      const json = await res.json();
      if (json.success && json.data) {
        setPosts((prev) => [...prev, ...json.data]);
        setPage(nextPage);
        setHasMore(nextPage < (json.meta?.pages ?? 1));
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <>
      <AnalyticsTracker />
      <PageHeader
        title="From the C2D Tech blog"
        description="Notes on software engineering, product thinking and shipping real products from concept to deploy."
        crumb="Blog"
      />

      <section className="pb-24">
        <div className="container">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="flex h-[380px] flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/70 p-4 shadow-sm animate-pulse dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="aspect-[16/9] w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="mt-5 space-y-3 p-2">
                    <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-full rounded bg-slate-200/70 dark:bg-slate-800/70" />
                    <div className="h-4 w-2/3 rounded bg-slate-200/70 dark:bg-slate-800/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts published yet"
              description="We're still writing fresh insights and product stories. Check back soon!"
            />
          ) : (
            <div className="space-y-12">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post: Blog) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 font-bold border-2 border-[#95CCDD] text-[#293681] hover:border-[#4274D9] hover:bg-[#D0E7E6]/30 hover:text-[#4274D9] active:scale-[0.99]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4 text-[#4274D9]" /> Loading more articles…
                      </>
                    ) : (
                      <>
                        Load More Articles <ArrowDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
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
