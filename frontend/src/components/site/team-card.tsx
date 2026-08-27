"use client";

import Image from "next/image";
import { Github, Linkedin, Twitter, Globe } from "lucide-react";
import type { TeamMember } from "@/types";
import { StaggerItem } from "@/components/site/reveal";

const SOCIALS = [
  { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
  { key: "github", icon: Github, label: "GitHub" },
  { key: "twitter", icon: Twitter, label: "Twitter" },
  { key: "website", icon: Globe, label: "Website" },
] as const;

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <StaggerItem>
      <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/90 bg-white/95 p-4 shadow-[0_10px_30px_rgba(41,54,129,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#4274D9]/40 hover:shadow-[0_20px_40px_rgba(41,54,129,0.12)] dark:border-slate-800 dark:bg-slate-900/90">
        {/* Photo Container */}
        <div className="relative aspect-[4/4.5] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#293681]">
              <span className="text-4xl font-extrabold text-[#95CCDD]">
                {member.name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("")}
              </span>
            </div>
          )}

          {/* Floating Social Icons Overlay */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur transition-all hover:bg-[#4274D9] hover:text-white hover:scale-110 dark:bg-slate-800/90 dark:text-white dark:hover:bg-[#4274D9]"
                  aria-label={`${member.name}'s ${label}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Member Details */}
        <div className="p-4 text-center">
          <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {member.name}
          </h3>
          <p className="mt-1 inline-block rounded-full bg-[#D0E7E6]/40 px-3 py-0.5 text-xs font-semibold text-[#4274D9] dark:bg-[#4274D9]/15 dark:text-[#95CCDD]">
            {member.position}
          </p>
          {member.bio && (
            <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {member.bio}
            </p>
          )}
        </div>
      </div>
    </StaggerItem>
  );
}


