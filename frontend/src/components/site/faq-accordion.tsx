"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Faq } from "@/types";
import { cn } from "@/lib/utils";

export function FaqAccordion({ faqs, defaultOpen = 0 }: { faqs: Faq[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number | null>(faqs.length ? defaultOpen : null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq._id}
            className={cn(
              "overflow-hidden rounded-xl border bg-card transition-colors",
              isOpen && "border-primary/40"
            )}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${faq._id}`}
            >
              <span className="font-medium">{faq.question}</span>
              <Plus className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-45")} aria-hidden="true" />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-answer-${faq._id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${faq._id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
