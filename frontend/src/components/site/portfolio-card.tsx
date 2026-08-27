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
        className="group relative block overflow-hidden rounded-[28px] border border-slate-200/90 bg-white/95 shadow-[0_10px_30px_rgba(41,54,129,0.05)] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[#4274D9]/50 hover:shadow-[0_20px_45px_rgba(66,116,217,0.14)] dark:border-slate-800 dark:bg-slate-900/90"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#293681] text-3xl font-extrabold text-[#95CCDD]">
              {project.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 translate-y-3 p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="rounded-full bg-[#4274D9] px-3.5 py-1 text-xs font-bold text-white shadow-md">{project.category}</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 transition-colors duration-200 group-hover:text-[#4274D9] dark:text-white leading-snug">{project.title}</h3>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{project.client || project.year}</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D0E7E6]/50 text-[#4274D9] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#4274D9] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:bg-[#4274D9]/15 dark:text-[#95CCDD] dark:group-hover:bg-[#4274D9] dark:group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          {project.shortDescription && (
            <p className="mt-2.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{project.shortDescription}</p>
          )}
        </div>
      </Link>
    </StaggerItem>
  );
}
