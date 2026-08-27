import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import type { Blog } from "@/types";
import { StaggerItem } from "@/components/site/reveal";
import { formatDate } from "@/lib/utils";

export function BlogCard({ post }: { post: Blog }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/90 bg-white/95 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#4274D9]/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#293681] font-display text-2xl font-extrabold text-[#95CCDD]">
            {post.title.slice(0, 2).toUpperCase()}
          </div>
        )}
        {post.category && (
          <span className="absolute left-3.5 top-3.5 rounded-full border border-white/60 bg-white/90 px-3.5 py-1 text-xs font-bold text-[#293681] shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-[#95CCDD]">
            {post.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-[#4274D9] dark:text-white">{post.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{post.excerpt}</p>
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#4274D9]" /> {formatDate(post.publishedAt || post.createdAt)}
          </span>
          {post.readingTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#4274D9]" /> {post.readingTime} min read
            </span>
          )}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <span className="text-xs font-bold text-[#293681] dark:text-[#95CCDD]">{post.authorName}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D0E7E6]/50 text-[#4274D9] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#4274D9] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:bg-[#4274D9]/15 dark:text-[#95CCDD] dark:group-hover:bg-[#4274D9] dark:group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
