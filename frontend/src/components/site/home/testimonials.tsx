"use client";

import type { Testimonial } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { Stagger } from "@/components/site/reveal";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="section-pad">
      <div className="container">
        <SectionHeading
          eyebrow="Testimonials"
          title="What our clients say"
          description="Feedback from founders and teams we've shipped with."
        />
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t._id} testimonial={t} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}
