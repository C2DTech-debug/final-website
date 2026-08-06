import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import type { Blog } from "@/types";
import { StaggerItem } from "@/components/site/reveal";
import { formatDate } from "@/lib/utils";

export function BlogCard({ post }: { post: Blog }) {
  return (
    <StaggerItem>
      <Link
        href={`/blogs/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/30 to-cyan-500/30 font-display text-2xl font-bold text-white">
              {post.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          {post.category && (
            <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
              {post.category}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug">{post.title}</h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(post.publishedAt || post.createdAt)}
            </span>
            {post.readingTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {post.readingTime} min read
              </span>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium text-foreground">{post.authorName}</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
        </div>
      </Link>
    </StaggerItem>
  );
}
