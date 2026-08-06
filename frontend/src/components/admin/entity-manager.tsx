"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { EntityName } from "@/hooks/useAdmin";
import { useCreateEntity, useDeleteEntity, useEntities, useUpdateEntity } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ImageUpload } from "@/components/admin/image-upload";
import { toast } from "sonner";
import { cn, slugify } from "@/lib/utils";

export type EntityFieldType = "text" | "textarea" | "number" | "select" | "switch" | "tags" | "image" | "images";

export interface EntityField {
  name: string;
  label: string;
  type: EntityFieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  full?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export interface EntityColumn {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
  className?: string;
}

interface EntityManagerProps {
  entity: Exclude<EntityName, "blog" | "career">;
  title: string;
  description?: string;
  fields: EntityField[];
  columns: EntityColumn[];
}

type FormValue = string | number | boolean | string[];

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function setByPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  const result: Record<string, unknown> = { ...obj };
  let cursor = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const existing = cursor[k];
    if (!existing || typeof existing !== "object") {
      cursor[k] = {};
    }
    cursor = cursor[k] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1]] = value;
  return result;
}

function defaultValueFor(field: EntityField): FormValue {
  switch (field.type) {
    case "switch":
      return false;
    case "tags":
    case "images":
      return [];
    case "number":
      return "";
    default:
      return "";
  }
}

function convertFieldForSubmit(field: EntityField, value: FormValue): unknown {
  if (field.type === "number") {
    if (value === "" || value === undefined || value === null) return undefined;
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
  }
  return value;
}

function EntityFields({
  fields,
  values,
  set,
}: {
  fields: EntityField[];
  values: Record<string, FormValue>;
  set: (name: string, value: FormValue) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const value = values[field.name] ?? defaultValueFor(field);
        const input = (() => {
          switch (field.type) {
            case "textarea":
              return (
                <Textarea
                  rows={4}
                  placeholder={field.placeholder}
                  value={String(value)}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              );
            case "number":
              return (
                <Input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step ?? 1}
                  placeholder={field.placeholder}
                  value={String(value)}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              );
            case "select":
              return (
                <Select value={String(value)} onValueChange={(v) => set(field.name, v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || "Select…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            case "switch":
              return (
                <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                  <span className="text-sm">{field.label}</span>
                  <Switch checked={Boolean(value)} onCheckedChange={(v) => set(field.name, v)} />
                </div>
              );
            case "tags": {
              const tags = Array.isArray(value) ? value : [];
              return (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t, i) => (
                      <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {t}
                        <button
                          type="button"
                          className="ml-0.5 text-primary/70 hover:text-primary"
                          onClick={() => set(field.name, tags.filter((_, j) => j !== i))}
                          aria-label={`Remove ${t}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <TagsInput
                    onAdd={(tag) => {
                      if (tag && !tags.includes(tag)) set(field.name, [...tags, tag]);
                    }}
                  />
                </div>
              );
            }
            case "image":
              return <ImageUpload value={String(value)} onChange={(url) => set(field.name, url)} aspect={field.full ? "aspect-video" : "aspect-video"} />;
            case "images": {
              const list = Array.isArray(value) ? value : [];
              return (
                <div className="space-y-2">
                  {list.map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={String(url)} readOnly className="text-xs" />
                      <Button type="button" variant="outline" size="icon" onClick={() => set(field.name, list.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <ImageUpload value="" onChange={(url) => set(field.name, [...list, url])} aspect="aspect-[4/1]" />
                </div>
              );
            }
            default:
              return (
                <Input
                  placeholder={field.placeholder}
                  value={String(value)}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              );
          }
        })();

        if (field.type === "switch") return <React.Fragment key={field.name}>{input}</React.Fragment>;

        return (
          <div key={field.name} className={cn("space-y-1.5", field.full && "sm:col-span-2")}>
            <Label>{field.label}</Label>
            {input}
          </div>
        );
      })}
    </div>
  );
}

function TagsInput({ onAdd }: { onAdd: (tag: string) => void }) {
  const [text, setText] = React.useState("");
  return (
    <div className="flex gap-2">
      <Input
        value={text}
        placeholder="Type and press Enter"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const tag = text.trim();
            if (tag) onAdd(tag);
            setText("");
          }
        }}
      />
      <Button type="button" variant="outline" onClick={() => { if (text.trim()) { onAdd(text.trim()); setText(""); } }}>
        Add
      </Button>
    </div>
  );
}

function EntityFormDialog({
  open,
  onOpenChange,
  fields,
  entity,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: EntityField[];
  entity: Exclude<EntityName, "blog" | "career">;
  initial?: Record<string, unknown> | null;
}) {
  const create = useCreateEntity<Record<string, unknown>>();
  const update = useUpdateEntity<Record<string, unknown>>();
  const [values, setValues] = React.useState<Record<string, FormValue>>({});
  const [resetKey, setResetKey] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      const init: Record<string, FormValue> = {};
      for (const f of fields) {
        const v = initial ? getByPath(initial, f.name) : undefined;
        init[f.name] = (v as FormValue) ?? defaultValueFor(f);
      }
      setValues(init);
      setResetKey((k) => k + 1);
    }
  }, [open, initial, fields]);

  const isEdit = Boolean(initial?._id);

  const handleSubmit = async () => {
    const missing = fields
      .filter((f) => f.required)
      .map((f) => ({ f, v: convertFieldForSubmit(f, values[f.name] ?? defaultValueFor(f)) }))
      .filter(({ v }) => v === undefined || v === "" || (Array.isArray(v) && v.length === 0))
      .map(({ f }) => f.label);
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    const body: Record<string, unknown> = {};
    for (const f of fields) {
      body[f.name] = convertFieldForSubmit(f, values[f.name] ?? defaultValueFor(f));
    }

    // Auto-generate a slug from name/title when left blank (backend rejects empty slugs).
    const slugField = fields.find((f) => f.name === "slug");
    const baseField = fields.find((f) => f.name === "name" || f.name === "title");
    if (slugField && baseField && !String(body[slugField.name] ?? "").trim()) {
      const base = String(body[baseField.name] ?? "").trim();
      if (base) body[slugField.name] = slugify(base);
    }

    try {
      if (isEdit && initial) {
        await update.mutateAsync({ entity, id: String(initial._id), body });
      } else {
        await create.mutateAsync({ entity, body });
      }
      toast.success(isEdit ? "Updated" : "Created");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit item" : "Create item"}</DialogTitle>
          <DialogDescription>Fill in the fields below and save.</DialogDescription>
        </DialogHeader>
        <div key={resetKey} className="py-2">
          <EntityFields fields={fields} values={values} set={(name, value) => setValues((v) => ({ ...v, [name]: value }))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? <Spinner /> : isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EntityManager({ entity, title, description, fields, columns }: EntityManagerProps) {
  const { data, isLoading, isError } = useEntities<Record<string, unknown>>(entity);
  const del = useDeleteEntity();
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = React.useState<Record<string, unknown> | null>(null);

  const filtered = React.useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      fields.some((f) => {
        const v = getByPath(row, f.name);
        if (typeof v === "string") return v.toLowerCase().includes(q);
        if (Array.isArray(v)) return v.some((s) => String(s).toLowerCase().includes(q));
        return String(v ?? "").toLowerCase().includes(q);
      })
    );
  }, [data, search, fields]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync({ entity, id: String(deleting._id) });
      toast.success("Deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title={search ? "No matches" : `No ${title.toLowerCase()} yet`} description={description} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={String(row._id)}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(row) : String(getByPath(row, col.key) ?? "—")}
                    </TableCell>
                  ))}
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

      <EntityFormDialog open={dialogOpen} onOpenChange={setDialogOpen} fields={fields} entity={entity} initial={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete item?"
        description="This action cannot be undone."
        pending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
