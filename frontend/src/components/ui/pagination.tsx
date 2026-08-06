"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pages, total, onPageChange, className }: PaginationProps) {
  if (pages <= 1) return null;
  const items: (number | "...")[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  if (start > 1) items.push(1);
  if (start > 2) items.push("...");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < pages - 1) items.push("...");
  if (end < pages) items.push(pages);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <p className="text-sm text-muted-foreground">
        {total} result{total === 1 ? "" : "s"} — page {page} of {pages}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft />
        </Button>
        {items.map((it, idx) =>
          it === "..." ? (
            <span key={`e-${idx}`} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={it}
              variant={it === page ? "default" : "outline"}
              size="icon"
              className="h-9 w-9"
              onClick={() => onPageChange(it)}
            >
              {it}
            </Button>
          )
        )}
        <Button variant="outline" size="icon" disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
