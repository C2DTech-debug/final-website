"use client";

import * as React from "react";
import { Download, Mail, Trash2 } from "lucide-react";
import { useDeleteSubscriber, useSubscribers, exportUrl } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { formatDateTime } from "@/lib/utils";
import type { NewsletterSubscriber } from "@/types";
import { toast } from "sonner";

export default function AdminNewsletterPage() {
  const { data, isLoading } = useSubscribers();
  const del = useDeleteSubscriber();
  const [deleting, setDeleting] = React.useState<NewsletterSubscriber | null>(null);

  const subscribers = data ?? [];
  const active = subscribers.filter((s) => s.status === "subscribed").length;
  const unsubscribed = subscribers.filter((s) => s.status === "unsubscribed").length;

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting._id);
      toast.success("Subscriber removed");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Newsletter"
        description="Subscribers captured from the newsletter signup."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <a href={exportUrl("subscribers", "csv")} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" /> Export CSV
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={exportUrl("subscribers", "excel")} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" /> Export Excel
              </a>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total subscribers" value={subscribers.length} icon={Mail} tone="primary" />
        <StatCard title="Active" value={active} icon={Mail} tone="success" />
        <StatCard title="Unsubscribed" value={unsubscribed} icon={Mail} tone="danger" />
      </div>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : subscribers.length === 0 ? (
          <EmptyState title="No subscribers yet" description="Email signups from the site footer will appear here." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium">{s.email}</TableCell>
                  <TableCell>{s.name || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.source || "footer"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(s.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" aria-label="Delete subscriber" onClick={() => setDeleting(s)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Remove subscriber?"
        description={deleting ? `This will permanently remove ${deleting.email} from the list.` : undefined}
        pending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
