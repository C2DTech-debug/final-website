import Image from "next/image";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/types";
import { DEFAULT_AVATAR } from "@/constants";
import { StaggerItem } from "@/components/site/reveal";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <StaggerItem>
      <figure className="relative flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-[0_10px_30px_rgba(41,54,129,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#4274D9]/40 hover:shadow-[0_20px_40px_rgba(41,54,129,0.1)] dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none dark:hover:border-[#4274D9]/50">
        <Quote className="absolute right-6 top-6 h-8 w-8 text-[#4274D9]/20" />
        <div className="mb-4 flex gap-1" aria-label={`Rating: ${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          ))}
        </div>
        <blockquote className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">"{testimonial.content}"</blockquote>
        <figcaption className="mt-6 flex items-center gap-3.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <div className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-100 ring-2 ring-[#4274D9]/20 dark:bg-slate-800">
            {testimonial.avatar ? (
              <Image src={testimonial.avatar} alt={testimonial.name} fill sizes="44px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#293681] text-xs font-extrabold text-[#95CCDD]">
                {testimonial.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{testimonial.name}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {testimonial.role}
              {testimonial.company ? ` · ${testimonial.company}` : ""}
            </div>
          </div>
        </figcaption>
      </figure>
    </StaggerItem>
  );
}
