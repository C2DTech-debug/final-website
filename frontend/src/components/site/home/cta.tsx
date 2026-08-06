"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-700 via-fuchsia-600 to-cyan-600 opacity-90" />
      <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:48px_48px] opacity-20" />
      <div className="container text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-bold text-white md:text-5xl">Have an idea? Let's build it.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80 md:text-lg">
            Tell us where you want to go. We'll take it from concept to deploy — fast, secure and production-ready.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 font-semibold text-slate-900 shadow-xl transition-transform hover:scale-105"
            >
              Start a Conversation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/estimator"
              className="inline-flex h-12 items-center rounded-xl border border-white/40 px-8 font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Get an Estimate
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
