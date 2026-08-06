"use client";

import Link from "next/link";
import { Facebook, Github, Instagram, Linkedin, Mail, MapPin, Phone, Rocket, Twitter } from "lucide-react";
import { NAV_LINKS, SITE_NAME, SITE_TAGLINE } from "@/constants";
import { useSiteSettings } from "@/hooks/useSite";

const SOCIAL_ICONS = [
  { key: "github", icon: Github },
  { key: "linkedin", icon: Linkedin },
  { key: "twitter", icon: Twitter },
  { key: "facebook", icon: Facebook },
  { key: "instagram", icon: Instagram },
] as const;

export function SiteFooter() {
  const { data } = useSiteSettings();
  const settings = data ?? {};
  const company = (settings.company ?? {}) as Record<string, unknown>;
  const social = (settings.social ?? {}) as Record<string, unknown>;
  const footer = (settings.footer ?? {}) as Record<string, unknown>;

  const companyName = (company.name as string) || SITE_NAME;
  const tagline = (company.tagline as string) || SITE_TAGLINE;
  const description = (footer.description as string) || (company.description as string) || "";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400">
              <Rocket className="h-5 w-5 text-white" />
            </span>
            <span className="font-display text-lg font-bold">{companyName}</span>
          </Link>
          <p className="text-sm text-muted-foreground">{description || tagline}</p>
          <div className="flex gap-2">
            {SOCIAL_ICONS.map(({ key, icon: Icon }) => {
              const href = social[key] as string | undefined;
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border bg-background transition-colors hover:border-primary hover:text-primary"
                  aria-label={key}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Navigate</h3>
          <ul className="grid gap-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Company</h3>
          <ul className="grid gap-2.5 text-sm">
            <li><Link href="/estimator" className="text-muted-foreground transition-colors hover:text-primary">Project Estimator</Link></li>
            <li><Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">About Us</Link></li>
            <li><Link href="/portfolio" className="text-muted-foreground transition-colors hover:text-primary">Our Work</Link></li>
            <li><Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Get in touch</h3>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            {(company.email as string) && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${company.email}`} className="transition-colors hover:text-primary">{company.email as string}</a>
              </li>
            )}
            {(company.phone as string) && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href={`tel:${company.phone}`} className="transition-colors hover:text-primary">{company.phone as string}</a>
              </li>
            )}
            {(company.address as string) && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{company.address as string}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} {companyName}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-primary">Terms of Service</Link>
            <Link href="/cookies" className="transition-colors hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
