"use client";

import Link from "next/link";
import { Facebook, Github, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { SITE_NAME } from "@/constants";
import { useSiteSettings } from "@/hooks/useSite";

export function SiteFooter() {
  const { data } = useSiteSettings();
  const settings = data ?? {};
  const company = (settings.company ?? {}) as Record<string, unknown>;
  const social = (settings.social ?? {}) as Record<string, unknown>;
  const year = new Date().getFullYear();

  const companyName = "C2D TECH";
  const email = (company.email as string) || "info@c2dtech.com";
  const instagramUrl = (social.instagram as string) || "https://www.instagram.com/c2dtech";
  const linkedinUrl = (social.linkedin as string) || "https://www.linkedin.com/company/c2dtech";
  const youtubeUrl = (social.youtube as string) || "https://www.youtube.com/@c2dtech";
  const githubUrl = (social.github as string) || "https://github.com/c2dtech";
  const twitterUrl = (social.twitter as string) || "https://twitter.com/c2dtech";

  return (
    <footer className="border-t-2 border-[#4274D9] bg-[#293681] text-white pt-16 sm:pt-20 pb-12">
      <div className="container max-w-6xl px-4 sm:px-6">
        {/* Massive Bold Centered Title */}
        <div className="mb-14 sm:mb-16 md:mb-20 text-center">
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-[72px] tracking-tight uppercase text-white select-none">
            {companyName}
          </h2>
        </div>

        {/* 4 Clean Columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 md:grid-cols-4 lg:gap-x-14 pb-14 sm:pb-16 border-b border-white/15">
          {/* Column 1: OUR SERVICES */}
          <div>
            <h3 className="mb-5 text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#95CCDD]">
              OUR SERVICES
            </h3>
            <ul className="space-y-3.5 text-sm font-medium text-[#D0E7E6]/80">
              <li>
                <Link href="/services/website-development" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Full Stack
                </Link>
              </li>
              <li>
                <Link href="/services/mobile-apps" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link href="/services/ai-automation" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Data & AI
                </Link>
              </li>
              <li>
                <Link href="/services/software-development" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Custom Software
                </Link>
              </li>
              <li>
                <Link href="/services/cloud-devops" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Cloud & DevOps
                </Link>
              </li>
              <li>
                <Link href="/services/digital-marketing" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Digital Marketing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: QUICK LINKS */}
          <div>
            <h3 className="mb-5 text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#95CCDD]">
              QUICK LINKS
            </h3>
            <ul className="space-y-3 text-sm font-medium text-[#D0E7E6]/80">
              <li>
                <Link href="/" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  About
                </Link>
              </li>
              <li>
                <Link href="/team" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Team
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: C2D TECH */}
          <div>
            <h3 className="mb-5 text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#95CCDD]">
              C2D TECH
            </h3>
            <ul className="space-y-3.5 text-sm font-medium text-[#D0E7E6]/80">
              <li>
                <Link href="/estimator" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Project Estimator
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Terms Of Use
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: CONNECT WITH US */}
          <div>
            <h3 className="mb-5 text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#95CCDD]">
              CONNECT WITH US
            </h3>
            <div className="space-y-6">
              <p className="text-sm font-medium text-[#D0E7E6]/90">
                Email:{" "}
                <a href={`mailto:${email}`} className="text-white font-semibold hover:text-[#95CCDD] transition-colors break-all">
                  {email}
                </a>
              </p>

              {/* Social Icons in Brand Palette */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#D0E7E6] backdrop-blur transition-all duration-300 hover:scale-110 hover:border-[#4274D9] hover:bg-[#4274D9] hover:text-white hover:shadow-md"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#D0E7E6] backdrop-blur transition-all duration-300 hover:scale-110 hover:border-[#4274D9] hover:bg-[#4274D9] hover:text-white hover:shadow-md"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#D0E7E6] backdrop-blur transition-all duration-300 hover:scale-110 hover:border-[#4274D9] hover:bg-[#4274D9] hover:text-white hover:shadow-md"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#D0E7E6] backdrop-blur transition-all duration-300 hover:scale-110 hover:border-[#4274D9] hover:bg-[#4274D9] hover:text-white hover:shadow-md"
                    aria-label="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#D0E7E6] backdrop-blur transition-all duration-300 hover:scale-110 hover:border-[#4274D9] hover:bg-[#4274D9] hover:text-white hover:shadow-md"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar matching Desktop & Mobile screenshots */}
        <div className="pt-8 text-xs font-medium text-[#D0E7E6]/70">
          {/* Desktop View: Left copyright + Right built by */}
          <div className="hidden md:flex items-center justify-between">
            <p>© {year} {companyName}. All rights reserved.</p>
            <p className="font-semibold tracking-wide text-white">
              Handcrafted with <span className="text-rose-400">❤️</span> by founding friends in Trichy
            </p>
          </div>

          {/* Mobile View: Stacked centered */}
          <div className="flex flex-col items-center justify-center gap-2 text-center md:hidden">
            <p className="font-semibold text-white text-xs">
              Handcrafted with <span className="text-rose-400">❤️</span> by founding friends in Trichy
            </p>
            <p className="text-[11px] text-[#D0E7E6]/60">
              © {year} {companyName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
