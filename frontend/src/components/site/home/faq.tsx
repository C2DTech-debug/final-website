"use client";

import type { Faq } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { Reveal } from "@/components/site/reveal";

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <section className="section-pad">
      <div className="container">
        <SectionHeading eyebrow="FAQ" title="Questions? Answered." description="Everything you need to know before we start working together." />
        <Reveal className="mx-auto max-w-3xl">
          <FaqAccordion faqs={faqs} />
        </Reveal>
      </div>
    </section>
  );
}
