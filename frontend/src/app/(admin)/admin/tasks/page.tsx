"use client";

import * as React from "react";
import { ListTodo, Plus, Search } from "lucide-react";
import {
  useAdminUserOptions,
  useAllTasks,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
  useVerifyTask,
} from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type Task,
} from "@/types";
import { formatDate, getErrorMessage, initials } from "@/lib/utils";
import { toast } from "sonner";

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  high: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "medium",
  points: "",
  assignedTo: "",
  dueDate: "",
};

export default function AdminTasksPage() {
  const [status, setStatus] = React.useState("");
  const [search, setSearch] = React.useState("");
  const { data, isLoading } = useAllTasks({ ...(status ? { status } : {}), ...(search ? { search } : {}) });
  const { data: userOptions } = useAdminUserOptions();
  const create = useCreateTask();
  const update = useUpdateTask();
  const del = useDeleteTask();
  const verify = useVerifyTask();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [deleting, setDeleting] = React.useState<Task | null>(null);
  const [verifying, setVerifying] = React.useState<Task | null>(null);
  const [verifyAction, setVerifyAction] = React.useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const tasks = data ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      points: String(task.points ?? 0),
      assignedTo: typeof task.assignedTo === "string" ? task.assignedTo : task.assignee?._id || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setOpen(true);
  };

  const openVerify = (task: Task, action: "approve" | "reject") => {
    setVerifying(task);
    setVerifyAction(action);
    setRejectReason("");
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.assignedTo) {
      toast.error("Title and assignee are required");
      return;
    }
    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority as Task["priority"],
      points: Number(form.points) || 0,
      assignedTo: form.assignedTo,
      dueDate: form.dueDate ? new Date(`${form.dueDate}T00:00:00`).toISOString() : null,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing._id, body });
        toast.success("Task updated");
      } else {
        await create.mutateAsync(body);
        toast.success("Task created");
      }
      setOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting._id);
      toast.success("Task deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleVerify = async () => {
    if (!verifying || !verifyAction) return;
    if (verifyAction === "reject" && !rejectReason.trim()) {
      toast.error("Add a reason for rejection");
      return;
    }
    try {
      await verify.mutateAsync({
        id: verifying._id,
        action: verifyAction,
        rejectionReason: verifyAction === "reject" ? rejectReason.trim() : undefined,
      });
      toast.success(verifyAction === "approve" ? `Approved (+${verifying.points} pts awarded)` : "Task rejected");
      setVerifying(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const pending = create.isPending || update.isPending;
  const assigneeName = (task: Task) => task.assignee?.name || (task.assignedTo ? "Unknown" : "Unassigned");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tasks"
        description="Create and assign work, track progress, verify submissions and award points."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 basis-52">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState title="No tasks found" description="Create a task to get started." icon={ListTodo} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-52" />
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
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">{initials(assigneeName(task))}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assigneeName(task)}</span>
                    </div>
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
                    <div className="flex items-center gap-1">
                      {task.status === "submitted" && (
                        <Button variant="default" size="sm" onClick={() => openVerify(task, "approve")} disabled={verify.isPending}>
                          Verify
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openEdit(task)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(task)} disabled={task.status === "completed"}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
            <DialogDescription>{editing ? "Update the task details." : "Assign a task to a team member."}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {TASK_PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={form.assignedTo || undefined} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {(userOptions ?? []).map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name} · {u.roleLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={pending}>
              {pending ? <Spinner /> : editing ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(verifying)} onOpenChange={(o) => !o && setVerifying(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {verifyAction === "approve" ? "Verify task" : "Reject submission"}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === "approve"
                ? `Approve "${verifying?.title}" and award ${verifying?.points ?? 0} points.`
                : `Reject "${verifying?.title}" so the assignee can rework it.`}
            </DialogDescription>
          </DialogHeader>

          {verifyAction === "approve" && verifying?.submissionNote && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="mb-1 font-medium">Assignee note</p>
              <p className="text-muted-foreground">{verifying.submissionNote}</p>
            </div>
          )}

          {verifyAction === "reject" && (
            <div className="space-y-2">
              <Label>Rejection reason</Label>
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="What needs to be reworked?" />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifying(null)} disabled={verify.isPending}>
              Cancel
            </Button>
            {verifyAction === "reject" && (
              <Button variant="destructive" onClick={handleVerify} disabled={verify.isPending}>
                {verify.isPending ? <Spinner /> : "Reject"}
              </Button>
            )}
            {verifyAction === "approve" && (
              <Button onClick={handleVerify} disabled={verify.isPending}>
                {verify.isPending ? <Spinner /> : "Approve"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete task?"
        description={deleting ? `"${deleting.title}" will be permanently removed.` : undefined}
        pending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
