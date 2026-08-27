"use client";

import * as React from "react";
import { ArrowUp, Phone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn, buildWhatsAppUrl } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSite";

export function FloatingActions() {
  const [visible, setVisible] = React.useState(false);
  const { data } = useSiteSettings();
  const settings = data ?? {};
  const company = (settings.company ?? {}) as Record<string, unknown>;
  const misc = (settings.misc ?? {}) as Record<string, unknown>;
  const social = (settings.social ?? {}) as Record<string, unknown>;
  const phone = (company.phone as string) || "917904006320";
  const whatsappNumber = (misc.whatsappNumber as string) || (social.whatsapp as string) || "917904006320";
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, "Hi C2D Tech! I'd like to discuss a project.");

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      <AnimatePresence>
        {visible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md backdrop-blur transition-all hover:bg-[#4274D9] hover:text-white dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-200"
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Call Button */}
      <a
        href={`tel:${phone}`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e275f] text-white shadow-lg shadow-[#1e275f]/40 transition-all hover:scale-110 hover:bg-[#293681]"
        aria-label="Call C2D Tech"
      >
        <Phone className="h-5 w-5" />
      </a>

      {/* WhatsApp Button with Official WhatsApp Logo */}
      <a
        href={whatsappUrl || undefined}
        target="_blank"
        rel="noreferrer"
        className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/40 transition-all hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 fill-white"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.979-.276-.1-.476-.15-.676.15-.2.301-.776.979-.952 1.18-.175.2-.35.226-.651.076-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.784-1.674-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.926-2.232-.244-.587-.493-.507-.676-.516l-.576-.01c-.2 0-.526.075-.802.376-.275.301-1.052 1.028-1.052 2.508 0 1.48 1.078 2.909 1.228 3.109.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.634.721.23 1.377.198 1.896.12.577-.087 1.782-.728 2.032-1.43.25-.702.25-1.304.175-1.43-.075-.125-.275-.2-.576-.35zm-5.467 7.404h-.008a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c0-5.445 4.43-9.874 9.879-9.874 2.634 0 5.111 1.027 6.974 2.89a9.833 9.833 0 012.885 6.984c0 5.448-4.43 9.882-9.852 9.882zM12.005 0C5.385 0 0 5.385 0 12.005c0 2.112.553 4.176 1.603 5.996L0 24l6.173-1.618A11.96 11.96 0 0012.005 24c6.62 0 12.005-5.385 12.005-12.005C24.01 5.385 18.625 0 12.005 0z" />
        </svg>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-20" />
      </a>
    </div>
  );
}

export function ScrollDown({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex justify-center", className)}>
      <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/40 p-1.5">
        <motion.span
          className="h-2 w-1 rounded-full bg-primary"
          animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
