"use client";

import { Mail, MapPin, Phone, Clock } from "lucide-react";
import type { PublicSettings } from "@/types";
import { SectionHeading } from "@/components/site/section-heading";
import { ContactForm } from "@/components/site/contact-form";
import { Reveal } from "@/components/site/reveal";

export function ContactSection({ settings }: { settings: PublicSettings }) {
  const contact = (settings.contact ?? {}) as Record<string, unknown>;

  const items = [
    { icon: Mail, label: "Email", value: (contact.email as string) || "" },
    { icon: Phone, label: "Phone", value: (contact.phone as string) || "" },
    { icon: MapPin, label: "Address", value: (contact.address as string) || "" },
    { icon: Clock, label: "Hours", value: (contact.hours as string) || "" },
  ].filter((it) => it.value);

  return (
    <section className="section-pad bg-muted/30" id="contact">
      <div className="container">
        <SectionHeading
          eyebrow="Get in touch"
          title="Let's talk about your project"
          description="Fill in the form and we'll reply within 24 hours."
        />
        <div className="grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="rounded-2xl border bg-card p-6 md:p-8">
              <ContactForm />
            </div>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-2">
            <div className="flex h-full flex-col gap-4">
              {items.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
