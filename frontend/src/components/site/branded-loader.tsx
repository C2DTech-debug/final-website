import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandedLoaderProps {
  label?: string;
  className?: string;
}

export function BrandedLoader({ label = "Loading your experience…", className }: BrandedLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-5 py-10 text-center", className)} role="status" aria-live="polite">
      <div className="relative">
        <span className="animate-c2d-float relative flex h-14 w-14 overflow-hidden items-center justify-center rounded-2xl bg-white border border-slate-200/90 dark:border-slate-800 dark:bg-slate-900 p-1 shadow-md">
          <Image
            src="/brand-logo.png"
            alt="C2D Tech"
            width={56}
            height={56}
            className="h-full w-full object-contain"
            priority
          />
        </span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          C2D <span className="text-[#4274D9]">Tech</span>
        </p>
        <span className="block h-1 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <span className="animate-c2d-slide block h-full w-1/3 rounded-full bg-[#4274D9]" />
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <span className="sr-only">Loading content</span>
    </div>
  );
}
