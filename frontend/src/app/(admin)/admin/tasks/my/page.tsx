"use client";

import * as React from "react";
import { CheckCircle2, ClipboardList, Clock, Send, Star } from "lucide-react";
import { useMyTaskStats, useMyTasks, useSubmitTask } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { TASK_PRIORITY_LABELS, type Task } from "@/types";
import { formatDate, getErrorMessage, timeAgo } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
] as const;

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  high: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

export default function MyTasksPage() {
  const [status, setStatus] = React.useState("");
  const { data, isLoading } = useMyTasks(status ? { status } : {});
  const stats = useMyTaskStats();
  const submit = useSubmitTask();

  const [submitting, setSubmitting] = React.useState<Task | null>(null);
  const [form, setForm] = React.useState({ submissionNote: "", submissionUrl: "" });

  const tasks = data ?? [];

  const openSubmit = (task: Task) => {
    setSubmitting(task);
    setForm({ submissionNote: task.submissionNote || "", submissionUrl: task.submissionUrl || "" });
  };

  const handleSubmit = async () => {
    if (!submitting) return;
    if (!form.submissionNote.trim()) {
      toast.error("Please add a submission note");
      return;
    }
    try {
      await submit.mutateAsync({ id: submitting._id, body: { submissionNote: form.submissionNote.trim(), submissionUrl: form.submissionUrl.trim() } });
      toast.success("Task submitted for review");
      setSubmitting(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const canSubmit = (task: Task) => ["pending", "in_progress", "rejected"].includes(task.status);

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Tasks"
        description="Tasks assigned to you — submit work once done to earn points."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Open" value={stats.data?.pending ?? 0} icon={Clock} tone="warning" />
        <StatCard title="In progress" value={stats.data?.inProgress ?? 0} icon={ClipboardList} />
        <StatCard title="Awaiting review" value={stats.data?.submitted ?? 0} icon={Send} tone="primary" />
        <StatCard title="Points earned" value={stats.data?.totalEarned ?? 0} icon={Star} tone="success" />
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="flex-wrap">
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState title="No tasks" description="When your manager assigns you a task, it will appear here." icon={ClipboardList} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>
                    <p className="text-sm font-medium">{task.title}</p>
                    {task.description && <p className="max-w-md truncate text-xs text-muted-foreground">{task.description}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge className={PRIORITY_STYLES[task.priority] || ""}>{TASK_PRIORITY_LABELS[task.priority] || task.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-semibold">{task.points}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{task.dueDate ? formatDate(task.dueDate) : "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    {canSubmit(task) ? (
                      <Button variant="outline" size="sm" onClick={() => openSubmit(task)} disabled={submit.isPending}>
                        {task.status === "rejected" ? "Resubmit" : "Submit"}
                      </Button>
                    ) : task.status === "submitted" ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {task.submittedAt ? timeAgo(task.submittedAt) : ""}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Done
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={Boolean(submitting)} onOpenChange={(o) => !o && setSubmitting(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit "{submitting?.title}"</DialogTitle>
            <DialogDescription>Add a note describing what you did. Your manager will review it and award points.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Submission note</Label>
              <Textarea
                value={form.submissionNote}
                onChange={(e) => setForm({ ...form, submissionNote: e.target.value })}
                placeholder="What did you complete? Anything the reviewer should know?"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Link / URL (optional)</Label>
              <Input
                value={form.submissionUrl}
                onChange={(e) => setForm({ ...form, submissionUrl: e.target.value })}
                placeholder="https://github.com/…, https://preview.…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitting(null)} disabled={submit.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submit.isPending}>
              {submit.isPending ? <Spinner /> : <Send className="mr-1 h-4 w-4" />} Submit for review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
