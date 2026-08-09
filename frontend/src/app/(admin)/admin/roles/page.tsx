"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useCreateRole, useDeleteRole, usePermissions, useRoles, useUpdateRole } from "@/hooks/useAdmin";
import type { Permission, RoleDoc } from "@/types";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
  const grouped: Record<string, Permission[]> = {};
  for (const p of permissions) {
    const g = p.group || p.module || "Other";
    (grouped[g] ??= []).push(p);
  }
  return grouped;
}

export default function AdminRolesPage() {
  const { data: roles, isLoading } = useRoles();
  const { data: permissions } = usePermissions();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<RoleDoc | null>(null);
  const [deleting, setDeleting] = React.useState<RoleDoc | null>(null);
  const del = useDeleteRole();

  const knownNames = React.useMemo(() => new Set((permissions ?? []).map((p) => p.name)), [permissions]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting._id);
      toast.success("Role deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Roles & Permissions"
        description="Create custom roles and grant exact per-module access — view, create, edit, delete, and more."
        actions={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> New role
          </Button>
        }
      />

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
          </div>
        ) : !roles || roles.length === 0 ? (
          <EmptyState title="No roles yet" description="Create roles to define access levels for your team." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>System</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => {
                const granted = (role.permissions ?? []).filter((p) => knownNames.has(p)).length;
                return (
                  <TableRow key={role._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-medium">{role.label}</p>
                          <p className="text-xs text-muted-foreground">{role.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">L{role.level}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{granted} granted</TableCell>
                    <TableCell>
                      {role.system ? <Badge variant="default">System</Badge> : <span className="text-xs text-muted-foreground">Custom</span>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(role); setDialogOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleting(role)}
                            disabled={role.system}
                          >
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

      <RoleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete role?"
        description={deleting ? `This will permanently delete the "${deleting.label}" role.` : undefined}
        pending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function RoleFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: RoleDoc | null;
}) {
  const create = useCreateRole();
  const update = useUpdateRole();
  const { data: permissions } = usePermissions();
  const [name, setName] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [level, setLevel] = React.useState("1");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");

  const knownNames = React.useMemo(() => new Set((permissions ?? []).map((p) => p.name)), [permissions]);

  React.useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setLabel(editing?.label ?? "");
      setDescription(editing?.description ?? "");
      setLevel(String(editing?.level ?? 1));
      // Drop stale grants that are no longer in the catalog.
      setSelected(new Set((editing?.permissions ?? []).filter((p) => knownNames.has(p))));
      setSearch("");
    }
  }, [open, editing, knownNames]);

  const grouped = React.useMemo(() => groupPermissions(permissions ?? []), [permissions]);

  const q = search.trim().toLowerCase();
  const visibleGroups = React.useMemo(() => {
    if (!q) return grouped;
    const out: Record<string, Permission[]> = {};
    for (const [g, perms] of Object.entries(grouped)) {
      const hit = perms.filter(
        (p) => p.label.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)
      );
      if (hit.length) out[g] = hit;
    }
    return out;
  }, [grouped, q]);

  const pending = create.isPending || update.isPending;

  const toggle = (perm: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  /** Full access / view-only / none for a whole permission group. */
  const applyPreset = (group: Permission[], preset: "all" | "view" | "none") => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of group) {
        if (preset === "all") next.add(p.name);
        else if (preset === "view") {
          if (p.action === "view" || p.action === "view_all") next.add(p.name);
          else next.delete(p.name);
        } else {
          next.delete(p.name);
        }
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim() || !label.trim()) {
      toast.error("Name and label are required");
      return;
    }
    const body = {
      name: name.trim(),
      label: label.trim(),
      description,
      level: Number(level) || 1,
      permissions: Array.from(selected),
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing._id, body });
        toast.success("Role updated");
      } else {
        await create.mutateAsync(body);
        toast.success("Role created");
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
          <DialogTitle>{editing ? `Edit ${editing.label}` : "New role"}</DialogTitle>
          <DialogDescription>Define the role and pick exactly which modules and actions it can access.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={name} placeholder="sales_rep" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Label *</Label>
              <Input value={label} placeholder="Sales Representative" onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Input type="number" min={0} max={10} value={level} onChange={(e) => setLevel(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What can this role do?" />
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold">Permissions ({selected.size} of {permissions?.length ?? 0})</p>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search permissions…"
                    className="h-8 w-52 pl-8 text-xs"
                  />
                </div>
                {permissions && permissions.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => setSelected((prev) => (prev.size === permissions.length ? new Set() : new Set(permissions.map((p) => p.name))))}
                  >
                    {selected.size === permissions.length ? "Clear all" : "Select all"}
                  </Button>
                )}
              </div>
            </div>
            {Object.keys(visibleGroups).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No permissions match "{search}".</p>
            ) : (
              Object.entries(visibleGroups).map(([group, perms]) => {
                const groupSelected = perms.filter((p) => selected.has(p.name)).length;
                const full = perms.length > 0 && groupSelected === perms.length;
                return (
                  <div key={group} className="rounded-lg border p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group} <span className={cn(full && "font-semibold text-emerald-600 dark:text-emerald-400")}>{full ? "· full" : `· ${groupSelected}/${perms.length}`}</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="outline" size="sm" className="h-6 text-xs" onClick={() => applyPreset(perms, "all")}>
                          Full
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="h-6 text-xs" onClick={() => applyPreset(perms, "view")}>
                          View only
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="h-6 text-xs" onClick={() => applyPreset(perms, "none")}>
                          None
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                      {perms.map((p) => {
                        const checked = selected.has(p.name);
                        return (
                          <label
                            key={p._id}
                            title={p.description || p.name}
                            className={cn(
                              "flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                              checked ? "border-primary/40 bg-primary/10" : "hover:border-primary/30"
                            )}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 h-3.5 w-3.5"
                              checked={checked}
                              onChange={() => toggle(p.name)}
                            />
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{p.label || p.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">{p.name}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? <Spinner /> : editing ? "Save changes" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
