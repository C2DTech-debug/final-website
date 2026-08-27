import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "mb-12 max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">{title}</h2>
      {description && <p className="mt-3.5 text-slate-600 dark:text-slate-300 md:text-lg leading-relaxed">{description}</p>}
    </Reveal>
  );
}
