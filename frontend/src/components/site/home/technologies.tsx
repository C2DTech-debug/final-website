"use client";

import { TECH_STACK } from "@/constants";
import { Reveal } from "@/components/site/reveal";

export function Technologies() {
  const doubled = [...TECH_STACK, ...TECH_STACK];

  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="container">
        <Reveal>
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Technologies we ship with
          </p>
        </Reveal>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-4">
            {doubled.map((tech, i) => (
              <span
                key={`${tech}-${i}`}
                className="glass whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
