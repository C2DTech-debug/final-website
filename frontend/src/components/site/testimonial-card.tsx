import Image from "next/image";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/types";
import { DEFAULT_AVATAR } from "@/constants";
import { StaggerItem } from "@/components/site/reveal";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <StaggerItem>
      <figure className="relative flex h-full flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
        <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/15" />
        <div className="mb-3 flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">"{testimonial.content}"</blockquote>
        <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
            {testimonial.avatar ? (
              <Image src={testimonial.avatar} alt={testimonial.name} fill sizes="40px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-bold text-white">
                {testimonial.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold">{testimonial.name}</div>
            <div className="text-xs text-muted-foreground">
              {testimonial.role}
              {testimonial.company ? ` · ${testimonial.company}` : ""}
            </div>
          </div>
        </figcaption>
      </figure>
    </StaggerItem>
  );
}
