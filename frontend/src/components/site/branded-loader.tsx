import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandedLoaderProps {
  label?: string;
  className?: string;
}

export function BrandedLoader({ label = "Loading your experience…", className }: BrandedLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-5 py-10 text-center", className)} role="status" aria-live="polite">
      <div className="relative">
        <span className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-br from-violet-500/40 via-fuchsia-500/40 to-cyan-400/40 blur-xl" />
        <span className="animate-c2d-float relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400 shadow-lg shadow-primary/40">
          <Rocket className="h-6 w-6 text-white" />
        </span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="font-display text-lg font-bold tracking-tight">
          C2D <span className="text-gradient">Tech</span>
        </p>
        <span className="block h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <span className="animate-c2d-slide block h-full w-1/3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <span className="sr-only">Loading content</span>
    </div>
  );
}
