"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-[#293681] px-6 py-16 text-center shadow-xl sm:px-12 md:py-20 border-2 border-[#4274D9]/40">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0 bg-grid-pattern bg-[size:48px_48px] opacity-10" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
                Have an idea? Let&apos;s build it.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-[#D0E7E6] sm:text-lg">
                Tell us where you want to go. We&apos;ll take it from concept to deploy — fast, secure, and production-ready.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="group inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-7 text-base font-bold text-[#293681] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D0E7E6] hover:shadow-md active:translate-y-0 active:scale-[0.99]"
                >
                  Start a Conversation <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/estimator"
                  className="inline-flex h-12 items-center rounded-lg border-2 border-white/80 bg-transparent px-7 text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4274D9] hover:border-[#4274D9] active:translate-y-0 active:scale-[0.99]"
                >
                  Get an Estimate
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
