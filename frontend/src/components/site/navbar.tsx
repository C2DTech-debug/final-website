"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_LINKS } from "@/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSiteSettings } from "@/hooks/useSite";

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 overflow-hidden rounded-xl bg-black shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Image
          src="/brand-logo.png"
          alt="C2D Tech"
          width={36}
          height={36}
          className="h-full w-full object-cover"
          priority
        />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-[#293681] dark:text-white">
        C2D<span className="text-[#4274D9]"> Tech</span>
      </span>
    </Link>
  );
}

export function SiteNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { data: settings } = useSiteSettings();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever navigation completes.
  React.useEffect(() => setMenuOpen(false), [pathname]);

  const phone = (settings?.contact as Record<string, unknown> | undefined)?.phone;

  return (
    <header className="fixed inset-x-0 top-2 sm:top-4 z-50 px-3 sm:px-6 transition-all duration-300">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border px-4 sm:px-6 transition-all duration-300",
          scrolled
            ? "border-slate-200/90 bg-white/90 shadow-t4teq backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90"
            : "border-slate-200/60 bg-white/75 backdrop-blur-md shadow-sm dark:border-slate-800/80 dark:bg-slate-900/75"
        )}
      >
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors hover:text-[#4274D9]",
                pathname === link.href
                  ? "bg-[#D0E7E6]/50 font-semibold text-[#293681] dark:bg-[#4274D9]/20 dark:text-[#95CCDD]"
                  : "text-slate-600 dark:text-slate-300"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          <Button asChild size="sm" variant="default" className="rounded-lg font-bold">
            <Link href="/estimator">Get an Estimate</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 rounded-l-3xl border-slate-200 dark:border-slate-800">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="mt-6 flex flex-col gap-1.5">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-[#D0E7E6]/60 font-semibold text-[#293681] dark:bg-[#4274D9]/20 dark:text-[#95CCDD]"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-2 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button asChild className="w-full font-bold" variant="default">
                  <Link href="/estimator">Get an Estimate</Link>
                </Button>
                {typeof phone === "string" && phone.length > 0 && (
                  <Button asChild variant="outline" className="w-full">
                    <a href={`tel:${phone}`}>Call {phone}</a>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
