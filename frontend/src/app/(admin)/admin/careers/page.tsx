"use client";

import * as React from "react";
import { ExternalLink, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  useApplications,
  useCreateJob,
  useDeleteApplication,
  useDeleteJob,
  useJobs,
  useUpdateApplication,
  useUpdateJob,
} from "@/hooks/useAdmin";
import type { Job, JobApplication } from "@/types";
import { JOB_STATUS_LABELS, JOB_TYPE_LABELS, APPLICATION_STATUS, APPLICATION_STATUS_LABELS } from "@/types";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { formatDate, slugify, timeAgo } from "@/lib/utils";

// ---------- Jobs tab ----------

interface JobForm {
  title: string;
  slug: string;
  department: string;
  location: string;
  type: Job["type"];
  experience: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: Job["status"];
  featured: boolean;
  order: number;
}

function emptyJobForm(): JobForm {
  return {
    title: "",
    slug: "",
    department: "Engineering",
    location: "Trichy, Tamil Nadu (Remote friendly)",
    type: "full_time",
    experience: "",
    salary: "",
    description: "",
    responsibilities: [],
    requirements: [],
    benefits: [],
    status: "open",
    featured: false,
    order: 0,
  };
}

function fromJob(j: Job): JobForm {
  return {
    title: j.title,
    slug: j.slug,
    department: j.department ?? "Engineering",
    location: j.location ?? "",
    type: j.type,
    experience: j.experience ?? "",
    salary: j.salary ?? "",
    description: j.description ?? "",
    responsibilities: j.responsibilities ?? [],
    requirements: j.requirements ?? [],
    benefits: j.benefits ?? [],
    status: j.status,
    featured: j.featured ?? false,
    order: j.order ?? 0,
  };
}

function JobFormDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Job | null }) {
  const create = useCreateJob();
  const update = useUpdateJob();
  const [form, setForm] = React.useState<JobForm>(emptyJobForm());
  const [resetKey, setResetKey] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      setForm(editing ? fromJob(editing) : emptyJobForm());
      setResetKey((k) => k + 1);
    }
  }, [open, editing]);

  const set = <K extends keyof JobForm>(key: K, value: JobForm[K]) => setForm((f) => ({ ...f, [key]: value }));
  const pending = create.isPending || update.isPending;

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }
    const body = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      department: form.department || "Engineering",
      location: form.location,
      type: form.type,
      experience: form.experience,
      salary: form.salary,
      description: form.description,
      responsibilities: form.responsibilities,
      requirements: form.requirements,
      benefits: form.benefits,
      status: form.status,
      featured: form.featured,
      order: Number(form.order) || 0,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing._id, body });
        toast.success("Job updated");
      } else {
        await create.mutateAsync(body);
        toast.success("Job created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit job" : "New job opening"}</DialogTitle>
          <DialogDescription>Create or update a job posting.</DialogDescription>
        </DialogHeader>
        <div key={resetKey} className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} placeholder="Full Stack Developer" onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input value={form.slug} placeholder="full-stack-developer" onChange={(e) => set("slug", e.target.value)} onBlur={() => { if (!form.slug.trim() && form.title.trim()) set("slug", slugify(form.title)); }} />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input value={form.department} placeholder="Engineering" onChange={(e) => set("department", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location} placeholder="Trichy, Tamil Nadu (Remote friendly)" onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v as Job["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as Job["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Experience</Label>
              <Input value={form.experience} placeholder="2–4 years" onChange={(e) => set("experience", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Salary range</Label>
              <Input value={form.salary} placeholder="₹6–9 LPA" onChange={(e) => set("salary", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Order</Label>
              <Input type="number" value={String(form.order)} onChange={(e) => set("order", Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={5} value={form.description} placeholder="Overview of the role…" onChange={(e) => set("description", e.target.value)} />
          </div>

          <ListEditor label="Responsibilities" items={form.responsibilities} onChange={(v) => set("responsibilities", v)} />
          <ListEditor label="Requirements" items={form.requirements} onChange={(v) => set("requirements", v)} />
          <ListEditor label="Benefits" items={form.benefits} onChange={(v) => set("benefits", v)} />

          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <span className="text-sm">Featured role</span>
            <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? <Spinner /> : editing ? "Save changes" : "Create job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const [text, setText] = React.useState("");
  const add = () => {
    const v = text.trim();
    if (v) onChange([...items, v]);
    setText("");
  };
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={`${item}-${i}`} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
            <span>{item}</span>
            <button type="button" className="text-muted-foreground hover:text-destructive" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove">
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={text} placeholder="Add item and press Enter" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

// ---------- Applications tab ----------

function ApplicationsTab() {
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<string>("");
  const { data, isLoading } = useApplications({ page: String(page), q, status, limit: "20" });
  const updateApp = useUpdateApplication();
  const delApp = useDeleteApplication();
  const [deleting, setDeleting] = React.useState<JobApplication | null>(null);

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await delApp.mutateAsync(deleting._id);
      toast.success("Application deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleStatus = async (id: string, value: string) => {
    try {
      await updateApp.mutateAsync({ id, body: { status: value } });
      toast.success(`Status: ${APPLICATION_STATUS_LABELS[value]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search applicants…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <Select value={status || "__all__"} onValueChange={(v) => { setStatus(v === "__all__" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {APPLICATION_STATUS.map((s) => (
              <SelectItem key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No applications yet" description="Applications submitted through the careers page will appear here." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((app) => {
                const jobTitle = typeof app.job === "object" && app.job ? app.job.title : "—";
                return (
                  <TableRow key={app._id}>
                    <TableCell>
                      <p className="font-medium">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">{jobTitle}</TableCell>
                    <TableCell>
                      <Select value={app.status} onValueChange={(v) => handleStatus(app._id, v)}>
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STATUS.map((s) => (
                            <SelectItem key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {app.resumeUrl ? (
                        <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                          <ExternalLink className="h-3.5 w-3.5" /> {app.resumeName || "Resume"}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{timeAgo(app.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleting(app)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
        title="Delete application?"
        description={deleting ? `This will permanently delete the application from ${deleting.name}.` : undefined}
        pending={delApp.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ---------- Page ----------

export default function AdminCareersPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Job | null>(null);
  const [deleting, setDeleting] = React.useState<Job | null>(null);
  const { data: jobs, isLoading } = useJobs({});
  const del = useDeleteJob();

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting._id);
      toast.success("Job deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Careers"
        description="Job openings and incoming applications."
        actions={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> New job
          </Button>
        }
      />

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="rounded-xl border">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
              </div>
            ) : !jobs || jobs.length === 0 ? (
              <EmptyState title="No job openings" description="Create a job posting to start accepting applications." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job._id}>
                      <TableCell>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.location}</p>
                      </TableCell>
                      <TableCell className="text-sm">{job.department}</TableCell>
                      <TableCell className="text-sm">{JOB_TYPE_LABELS[job.type] ?? job.type}</TableCell>
                      <TableCell>
                        <Badge variant={job.status === "open" ? "default" : job.status === "draft" ? "secondary" : "outline"}>
                          {JOB_STATUS_LABELS[job.status] ?? job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.featured ? <Badge variant="default">Featured</Badge> : <span className="text-xs text-muted-foreground">No</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(job.updatedAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditing(job); setDialogOpen(true); }}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/careers/${job.slug}`, "_blank", "noopener,noreferrer")} disabled={job.status !== "open"}>
                              <ExternalLink className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleting(job)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationsTab />
        </TabsContent>
      </Tabs>

      <JobFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete job?"
        description={deleting ? `This will delete "${deleting.title}" and its applications.` : undefined}
        pending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
