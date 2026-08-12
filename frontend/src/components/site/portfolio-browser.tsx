"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { usePublicPortfolio } from "@/hooks/useSite";
import { PortfolioCard } from "@/components/site/portfolio-card";
import { Stagger } from "@/components/site/reveal";
import { BrandedLoader } from "@/components/site/branded-loader";
import { PortfolioEmptyState, PortfolioNoResults, PortfolioErrorState } from "@/components/site/portfolio-states";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PortfolioProject } from "@/types";

export function PortfolioBrowser({
  initialProjects,
  initialCategories,
}: {
  initialProjects: PortfolioProject[];
  initialCategories: string[];
}) {
  const [category, setCategory] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const { data, isLoading, isError, refetch } = usePublicPortfolio(
    { category, q: debouncedQ },
    {
      initialData: {
        data: initialProjects,
        meta: {
          page: 1,
          limit: initialProjects.length,
          total: initialProjects.length,
          pages: initialProjects.length ? 1 : 0,
          categories: initialCategories,
        },
      },
    }
  );

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const categories = data?.meta?.categories ?? [];
  const projects = data?.data ?? [];
  // Categories are derived from published projects, so a non-empty list means
  // projects genuinely exist even when the current filter returns nothing.
  const hasProjects = projects.length > 0 || categories.length > 0;
  const hasActiveFilters = category !== "All" || q !== "";

  const clearFilters = () => {
    setCategory("All");
    setQ("");
    setDebouncedQ("");
  };

  if (isLoading) {
    return <BrandedLoader label="Loading the portfolio…" />;
  }

  if (isError && !data) {
    return <PortfolioErrorState onRetry={() => refetch()} />;
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={category === cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" aria-label="Search projects" />
        </div>
      </div>

      {projects.length ? (
        <>
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <PortfolioCard key={project._id} project={project} />
            ))}
          </Stagger>
          {hasActiveFilters && (
            <div className="mt-10 flex justify-center">
              <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
            </div>
          )}
        </>
      ) : hasProjects ? (
        <PortfolioNoResults onClear={clearFilters} hasActiveFilters={hasActiveFilters} />
      ) : (
        <PortfolioEmptyState />
      )}
    </>
  );
}
