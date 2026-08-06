"use client";

import * as React from "react";
import Image from "next/image";
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  useBlogs,
  useCreateBlog,
  useDeleteBlog,
  useUpdateBlog,
} from "@/hooks/useAdmin";
import type { Blog } from "@/types";
import { BLOG_STATUS, BLOG_STATUS_LABELS } from "@/types";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { formatDate, slugify } from "@/lib/utils";

const PAGE_SIZE = 10;

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  authorName: string;
  status: Blog["status"];
  scheduledAt: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

function emptyForm(): BlogForm {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "General",
    tags: [],
    authorName: "Team C2D Tech",
    status: "draft",
    scheduledAt: "",
    featured: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  };
}

function fromBlog(b: Blog): BlogForm {
  return {
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt ?? "",
    content: b.content ?? "",
    coverImage: b.coverImage ?? "",
    category: b.category ?? "General",
    tags: b.tags ?? [],
    authorName: b.authorName ?? "Team C2D Tech",
    status: b.status,
    scheduledAt: b.scheduledAt ? new Date(b.scheduledAt).toISOString().slice(0, 16) : "",
    featured: b.featured ?? false,
    seoTitle: b.seo?.title ?? "",
    seoDescription: b.seo?.description ?? "",
    seoKeywords: b.seo?.keywords ?? "",
  };
}

export default function AdminBlogsPage() {
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<string>("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Blog | null>(null);
  const [deleting, setDeleting] = React.useState<Blog | null>(null);

  const { data, isLoading } = useBlogs({ page: String(page), limit: String(PAGE_SIZE), q, status });
  const create = useCreateBlog();
  const update = useUpdateBlog();
  const del = useDeleteBlog();

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting._id);
      toast.success("Blog deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Blog"
        description="Write, schedule and publish posts for the blog."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New post
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search posts…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select value={status || "__all__"} onValueChange={(v) => { setStatus(v === "__all__" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {BLOG_STATUS.map((s) => (
              <SelectItem key={s} value={s}>
                {BLOG_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No posts yet" description="Write your first blog post to share insights with the community." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {row.coverImage ? (
                        <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md border">
                          <Image src={row.coverImage} alt="" fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="h-10 w-16 shrink-0 rounded-md border bg-muted" />
                      )}
                      <div>
                        <p className="font-medium">{row.title}</p>
                        <p className="text-xs text-muted-foreground">{row.authorName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{row.category}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "published" ? "default" : row.status === "scheduled" ? "secondary" : "outline"}>
                      {BLOG_STATUS_LABELS[row.status] ?? row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{row.views}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.publishedAt ? formatDate(row.publishedAt) : "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(row);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(`/blogs/${row.slug}`, "_blank", "noopener,noreferrer")}
                          disabled={row.status !== "published"}
                        >
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleting(row)}>
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

      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {meta.page} of {meta.pages} · {meta.total} total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <BlogFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete post?"
        description={deleting ? `This will permanently delete "${deleting.title}".` : undefined}
        pending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function BlogFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Blog | null;
}) {
  const create = useCreateBlog();
  const update = useUpdateBlog();
  const [form, setForm] = React.useState<BlogForm>(emptyForm());
  const [resetKey, setResetKey] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      setForm(editing ? fromBlog(editing) : emptyForm());
      setResetKey((k) => k + 1);
    }
  }, [open, editing]);

  const set = <K extends keyof BlogForm>(key: K, value: BlogForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pending = create.isPending || update.isPending;

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }
    const body = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt,
      content: form.content,
      coverImage: form.coverImage,
      category: form.category || "General",
      tags: form.tags,
      authorName: form.authorName || "Team C2D Tech",
      status: form.status,
      scheduledAt: form.status === "scheduled" && form.scheduledAt ? new Date(form.scheduledAt).toISOString() : "",
      featured: form.featured,
      seo: {
        title: form.seoTitle,
        description: form.seoDescription,
        keywords: form.seoKeywords,
        ogImage: "",
        noindex: false,
      },
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing._id, body });
        toast.success("Post updated");
      } else {
        await create.mutateAsync(body);
        toast.success("Post created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleSlugBlur = () => {
    if (!form.slug.trim() && form.title.trim()) set("slug", slugify(form.title));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit post" : "New post"}</DialogTitle>
          <DialogDescription>Write and publish a blog post.</DialogDescription>
        </DialogHeader>

        <div key={resetKey} className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} placeholder="Post title" onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input value={form.slug} placeholder="post-slug" onChange={(e) => set("slug", e.target.value)} onBlur={handleSlugBlur} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={form.category} placeholder="Engineering" onChange={(e) => set("category", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Excerpt</Label>
            <Textarea rows={2} value={form.excerpt} placeholder="Short summary shown on cards…" onChange={(e) => set("excerpt", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Content (HTML)</Label>
            <Textarea rows={12} value={form.content} placeholder="<p>Write your post…</p>" onChange={(e) => set("content", e.target.value)} className="font-mono text-xs" />
            {form.content.trim() && (
              <details className="rounded-lg border p-3">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground">Preview</summary>
                <div className="prose-cms mt-2 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: form.content }} />
              </details>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Cover image</Label>
            <ImageUpload value={form.coverImage} onChange={(url) => set("coverImage", url)} />
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <TagEditor tags={form.tags} onChange={(tags) => set("tags", tags)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Author name</Label>
              <Input value={form.authorName} onChange={(e) => set("authorName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as Blog["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {BLOG_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.status === "scheduled" && (
            <div className="space-y-1.5">
              <Label>Schedule for</Label>
              <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <span className="text-sm">Featured post</span>
            <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
          </div>

          <div className="space-y-3 rounded-xl border p-4">
            <p className="text-sm font-semibold">SEO</p>
            <div className="space-y-1.5">
              <Label>SEO title</Label>
              <Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>SEO description</Label>
              <Input value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>SEO keywords</Label>
              <Input value={form.seoKeywords} onChange={(e) => set("seoKeywords", e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? <Spinner /> : editing ? "Save changes" : "Create post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [text, setText] = React.useState("");
  const add = () => {
    const tag = text.trim();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setText("");
  };
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => (
          <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
            {t}
            <button type="button" className="text-primary/70 hover:text-primary" onClick={() => onChange(tags.filter((_, j) => j !== i))} aria-label={`Remove ${t}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={text} placeholder="Type and press Enter" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" onClick={add}>Add</Button>
      </div>
    </div>
  );
}
