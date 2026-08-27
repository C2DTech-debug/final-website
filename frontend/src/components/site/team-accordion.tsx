"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Twitter, Globe } from "lucide-react";
import type { TeamMember } from "@/types";
import { cn } from "@/lib/utils";

const SOCIALS = [
  { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
  { key: "github", icon: Github, label: "GitHub" },
  { key: "twitter", icon: Twitter, label: "Twitter" },
  { key: "website", icon: Globe, label: "Website" },
] as const;

export function TeamAccordion({ members, className }: { members: TeamMember[]; className?: string }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  if (!members || members.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Horizontal Expanding Accordion (md and up) */}
      <div className="hidden md:flex h-[560px] w-full gap-3 lg:gap-4 overflow-hidden rounded-[36px] bg-slate-100/60 p-3 dark:bg-slate-950/40">
        {members.map((member, index) => {
          const isActive = activeIndex === index;

          return (
            <motion.div
              key={member._id || index}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              layout
              transition={{
                layout: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
              }}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-[28px] md:rounded-[32px] border transition-all duration-500 select-none",
                isActive
                  ? "flex-[3.5] lg:flex-[4] border-2 border-[#4274D9] bg-white shadow-xl dark:bg-slate-900"
                  : "flex-1 border border-slate-200 bg-slate-100 hover:border-[#4274D9] dark:border-slate-800 dark:bg-slate-900"
              )}
            >
              {/* Active Member Top Header */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="absolute top-6 left-6 right-6 z-20"
                  >
                    <p className="text-[11px] md:text-xs font-extrabold uppercase tracking-widest text-[#4274D9] dark:text-[#95CCDD]">
                      {member.position || "CORE TEAM"}
                    </p>
                    <h3 className="mt-1 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {member.name}
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Portrait Image / Avatar */}
              <div className="absolute inset-0 w-full h-full">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                    className="object-cover object-top transition-transform duration-500 hover:scale-105 opacity-100"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#293681] text-white">
                    <span className="text-4xl font-extrabold">
                      {member.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")}
                    </span>
                  </div>
                )}

                {/* Gradient Overlays */}
                {isActive ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-white/50 dark:to-slate-950/60 pointer-events-none" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                )}
              </div>

              {/* Active Card Bottom Bio & Social Links */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between gap-4"
                  >
                    <div className="max-w-[70%]">
                      {member.bio ? (
                        <p className="line-clamp-2 text-xs md:text-sm font-medium leading-relaxed text-white drop-shadow">
                          {member.bio}
                        </p>
                      ) : null}
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-2">
                      {SOCIALS.map(({ key, icon: Icon, label }) => {
                        const href = member.socialLinks?.[key];
                        if (!href) return null;
                        return (
                          <a
                            key={key}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#293681] shadow-md transition-all hover:scale-110 hover:bg-[#4274D9] hover:text-white"
                            aria-label={`${member.name}'s ${label}`}
                          >
                            <Icon className="h-4 w-4" />
                          </a>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inactive Slice Vertical Name Indicator */}
              {!isActive && (
                <div className="absolute inset-x-0 bottom-4 z-10 flex flex-col items-center">
                  <span className="truncate text-center text-xs font-bold text-white drop-shadow-md px-2 max-w-full">
                    {member.name.split(" ")[0]}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Sticky Stacking Cards for Mobile View (< md) */}
      <div className="relative flex md:hidden flex-col gap-8 pb-10">
        {members.map((member, index) => {
          const stickyTop = 84 + index * 16;
          const zIndex = index + 10;

          return (
            <div
              key={member._id || index}
              style={{
                top: `${stickyTop}px`,
                zIndex: zIndex,
              }}
              className="sticky overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_-8px_30px_rgba(41,54,129,0.12)] transition-all duration-300 dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Card Header & Photo with Full Portrait Visibility */}
              <div className="relative aspect-[4/4.2] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    priority={index === 0}
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#293681]">
                    <span className="text-4xl font-extrabold text-[#95CCDD]">
                      {member.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")}
                    </span>
                  </div>
                )}
                {/* Index Pill */}
                <div className="absolute top-3 right-3 rounded-md border border-white/60 bg-white/90 px-2.5 py-0.5 text-[11px] font-extrabold text-[#293681] shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-[#95CCDD]">
                  0{index + 1}
                </div>
              </div>

              {/* Member Details */}
              <div className="p-5 sm:p-6">
                <span className="inline-flex items-center rounded-md border border-[#95CCDD] bg-[#D0E7E6]/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#293681] dark:border-[#4274D9]/40 dark:bg-[#4274D9]/15 dark:text-[#95CCDD]">
                  {member.position || "CORE SQUAD"}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {member.name}
                </h3>
                {member.bio && (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {member.bio}
                  </p>
                )}

                {/* Social Links */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {SOCIALS.map(({ key, icon: Icon, label }) => {
                      const href = member.socialLinks?.[key];
                      if (!href) return null;
                      return (
                        <a
                          key={key}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-[#D0E7E6] text-[#293681] transition-all hover:bg-[#4274D9] hover:text-white dark:bg-[#4274D9]/20 dark:text-[#95CCDD] dark:hover:bg-[#4274D9] dark:hover:text-white"
                          aria-label={`${member.name}'s ${label}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </a>
                      );
                    })}
                  </div>
                  <span className="text-[11px] font-bold text-[#4274D9] dark:text-[#95CCDD]">
                    C2D Squad
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
