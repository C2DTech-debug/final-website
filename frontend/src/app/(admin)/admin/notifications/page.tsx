"use client";

import * as React from "react";
import { Bell, BellOff, CheckCheck, MoreHorizontal, Trash2 } from "lucide-react";
import { useDeleteNotification, useMarkAllRead, useMarkNotificationRead, useNotifications } from "@/hooks/useAdmin";
import type { Notification } from "@/types";
import { NOTIFICATION_TYPES } from "@/constants";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 20;

const TYPE_COLORS: Record<string, string> = {
  contact: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  lead: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  estimate: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  blog: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  career: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  system: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  login: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  error: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

export default function AdminNotificationsPage() {
  const [page, setPage] = React.useState(1);
  const [type, setType] = React.useState<string>("");
  const [readFilter, setReadFilter] = React.useState<string>("");
  const [deleting, setDeleting] = React.useState<Notification | null>(null);

  const { data, isLoading } = useNotifications({ page: String(page), limit: String(PAGE_SIZE), type, read: readFilter });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();
  const del = useDeleteNotification();

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const unread = meta?.unread ?? 0;

  const handleToggle = async (n: Notification) => {
    try {
      await markRead.mutateAsync({ id: n._id, read: !n.read });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAll.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting._id);
      toast.success("Notification deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}.` : "You're all caught up."}
        actions={
          <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={markAll.isPending || unread === 0}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={type || "__all__"} onValueChange={(v) => { setType(v === "__all__" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All types</SelectItem>
            {Object.entries(NOTIFICATION_TYPES).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={readFilter || "__all__"} onValueChange={(v) => { setReadFilter(v === "__all__" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Read state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All</SelectItem>
            <SelectItem value="false">Unread</SelectItem>
            <SelectItem value="true">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={BellOff} title="No notifications" description="System events and new leads will show up here." />
        ) : (
          <ul className="divide-y">
            {rows.map((n) => (
              <li key={n._id} className={cn("flex items-start gap-3 p-4", !n.read && "bg-primary/[0.03]")}>
                <button
                  type="button"
                  onClick={() => handleToggle(n)}
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                    TYPE_COLORS[n.type] || TYPE_COLORS.system
                  )}
                  aria-label={n.read ? "Mark as unread" : "Mark as read"}
                >
                  <Bell className={cn("h-4 w-4", !n.read && "fill-current")} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  {n.message && <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                      {NOTIFICATION_TYPES[n.type] ?? n.type}
                    </Badge>
                    <span>{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggle(n)}>
                      {n.read ? <Bell className="mr-2 h-4 w-4" /> : <CheckCheck className="mr-2 h-4 w-4" />}
                      {n.read ? "Mark unread" : "Mark read"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleting(n)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>

      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Page {meta.page} of {meta.pages} · {meta.total} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete notification?"
        description="This action cannot be undone."
        pending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
