"use client";

import { SectionHeading } from "@/components/site/section-heading";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { Reveal } from "@/components/site/reveal";

export function NewsletterSection() {
  return (
    <section className="border-t py-16">
      <div className="container">
        <Reveal className="glass mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl p-8 text-center md:p-12">
          <SectionHeading
            eyebrow="Newsletter"
            title="Stay in the loop"
            description="Product thinking, tech insights and company news. No spam — unsubscribe anytime."
          />
          <NewsletterForm source="footer" />
        </Reveal>
      </div>
    </section>
  );
}
