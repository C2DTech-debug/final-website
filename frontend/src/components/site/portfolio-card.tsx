import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/types";
import { StaggerItem } from "@/components/site/reveal";

export function PortfolioCard({ project }: { project: PortfolioProject }) {
  return (
    <StaggerItem>
      <Link
        href={`/portfolio/${project.slug}`}
        className="group relative block overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/30 to-cyan-500/30 text-3xl font-bold text-white">
              {project.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 translate-y-4 p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white">{project.category}</span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold leading-snug">{project.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{project.client || project.year}</p>
            </div>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          {project.shortDescription && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.shortDescription}</p>
          )}
        </div>
      </Link>
    </StaggerItem>
  );
}
