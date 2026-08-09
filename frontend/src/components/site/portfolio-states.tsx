import Link from "next/link";
import { ArrowRight, Rocket, SearchX, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortfolioEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 px-6 py-14 text-center sm:py-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)]" />

      <div className="relative mx-auto flex max-w-xl flex-col items-center">
        <div className="relative">
          <span className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-br from-violet-500/40 via-fuchsia-500/40 to-cyan-400/40 blur-lg" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400 shadow-lg shadow-primary/40">
            <Rocket className="h-7 w-7 text-white" />
          </div>
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Something great is <span className="text-gradient">being built</span>
        </h3>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          We&apos;re crafting our first collection of digital experiences — websites, apps and AI products for real-world
          teams. The showcase lands here soon.
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link href="/contact">
            Start a project with us <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function PortfolioNoResults({ onClear, hasActiveFilters }: { onClear: () => void; hasActiveFilters?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold">No projects match your search</h3>
      <p className="max-w-sm text-sm text-muted-foreground">Try another keyword or clear your filters.</p>
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onClear} className="mt-4">
          Clear filters
        </Button>
      )}
    </div>
  );
}

export function PortfolioErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <WifiOff className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold">Unable to load our portfolio right now</h3>
      <p className="max-w-sm text-sm text-muted-foreground">Please try again in a moment.</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
        Retry
      </Button>
    </div>
  );
}
