import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  new: "border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400",
  contacted: "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400",
  in_progress: "border-transparent bg-violet-500/15 text-violet-600 dark:text-violet-400",
  quoted: "border-transparent bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  won: "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  lost: "border-transparent bg-rose-500/15 text-rose-600 dark:text-rose-400",
  published: "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  draft: "border-transparent bg-muted text-muted-foreground",
  hidden: "border-transparent bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  subscribed: "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  unsubscribed: "border-transparent bg-muted text-muted-foreground",
  bounced: "border-transparent bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  published: "Published",
  draft: "Draft",
  hidden: "Hidden",
  subscribed: "Subscribed",
  unsubscribed: "Unsubscribed",
  bounced: "Bounced",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_COLORS[status] || "border-transparent bg-muted text-muted-foreground",
        className
      )}
    >
      {STATUS_LABELS[status] || status.replace(/_/g, " ")}
    </span>
  );
}
