import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  crumb?: string;
}

export function PageHeader({ title, description, eyebrow, crumb }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden pb-14 pt-32">
      <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute -top-32 left-1/2 -z-10 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="container text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl">{title}</h1>
        {description && <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300 md:text-lg">{description}</p>}
        <nav className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-[#4274D9]">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">{crumb || title}</span>
        </nav>
      </div>
    </section>
  );
}
