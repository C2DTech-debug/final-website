import Image from "next/image";
import { Github, Linkedin, Twitter, Globe } from "lucide-react";
import type { TeamMember } from "@/types";
import { DEFAULT_AVATAR } from "@/constants";
import { StaggerItem } from "@/components/site/reveal";

const SOCIALS = [
  { key: "github", icon: Github },
  { key: "linkedin", icon: Linkedin },
  { key: "twitter", icon: Twitter },
  { key: "website", icon: Globe },
] as const;

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <StaggerItem>
      <div className="group overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/40 to-cyan-500/40">
              <span className="text-5xl font-bold text-white">
                {member.name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("")}
              </span>
            </div>
          )}
          <div className="absolute inset-0 flex items-end justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
            {SOCIALS.map(({ key, icon: Icon }) => {
              const href = member.socialLinks?.[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors hover:bg-primary"
                  aria-label={key}
                >
                  <Icon className="h-4 w-4 text-white" />
                </a>
              );
            })}
          </div>
        </div>
        <div className="p-5 text-center">
          <h3 className="font-display font-semibold">{member.name}</h3>
          <p className="mt-0.5 text-sm text-primary">{member.position}</p>
        </div>
      </div>
    </StaggerItem>
  );
}
