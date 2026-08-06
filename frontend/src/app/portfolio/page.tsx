"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { usePublicPortfolio } from "@/hooks/useSite";
import { PageHeader } from "@/components/site/page-header";
import { PortfolioCard } from "@/components/site/portfolio-card";
import { Stagger } from "@/components/site/reveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

function PortfolioContent() {
  const [category, setCategory] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const { data, isLoading } = usePublicPortfolio({ category, q: debouncedQ });

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const categories = data?.meta?.categories ?? [];
  const projects = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    );
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
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <PortfolioCard key={project._id} project={project} />
          ))}
        </Stagger>
      ) : (
        <EmptyState title="No projects found" description="Try adjusting your search or filters." />
      )}

      {projects.length > 0 && (
        <div className="mt-12 flex justify-center">
          <Button variant="outline" onClick={() => { setCategory("All"); setQ(""); }}>Clear filters</Button>
        </div>
      )}
    </>
  );
}

export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our work"
        title="The C2D Tech portfolio"
        description="A selection of products we've designed, built and deployed. Search by technology or filter by category."
        crumb="Portfolio"
      />
      <section className="pb-24">
        <div className="container">
          <PortfolioContent />
        </div>
      </section>
    </>
  );
}
