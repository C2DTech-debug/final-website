"use client";

import * as React from "react";
import { Download, Eye, Search } from "lucide-react";
import {
  useAdminUserOptions,
  useDeleteEstimate,
  useEstimates,
  useUpdateEstimate,
  exportUrl,
} from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { ESTIMATE_STATUSES } from "@/constants";
import { formatINR, formatNumber, timeAgo } from "@/lib/utils";
import type { ProjectEstimate } from "@/types";
import { toast } from "sonner";

const PAGE_SIZE = 20;

function assignedName(row: ProjectEstimate): string {
  const a = row.assignedTo;
  if (!a) return "";
  return typeof a === "string" ? "—" : a.name;
}

function AssignedSelect({ row }: { row: ProjectEstimate }) {
  const { data: users } = useAdminUserOptions();
  const update = useUpdateEstimate();
  const current = typeof row.assignedTo === "object" && row.assignedTo ? row.assignedTo._id : "";

  const handleChange = async (value: string) => {
    try {
      await update.mutateAsync({ id: row._id, body: { assignedTo: value === "__unassigned__" ? undefined : value } });
      toast.success("Assigned");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign");
    }
  };

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-full min-w-36 text-xs">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__unassigned__">Unassigned</SelectItem>
        {users?.map((u) => (
          <SelectItem key={u._id} value={u._id}>
            {u.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEstimatesPage() {
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [selected, setSelected] = React.useState<ProjectEstimate | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<ProjectEstimate | null>(null);

  const { data, isLoading } = useEstimates({ page: String(page), q, status, limit: String(PAGE_SIZE) });
  const del = useDeleteEstimate();
  const update = useUpdateEstimate();

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting._id);
      toast.success("Estimate deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleStatusChange = async (id: string, value: string) => {
    try {
      await update.mutateAsync({ id, body: { status: value } });
      toast.success(`Status: ${ESTIMATE_STATUSES.find((s) => s.value === value)?.label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Estimates"
        description="Project cost estimates from the online estimator."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={exportUrl("estimates", "csv", { status })} target="_blank" rel="noreferrer">Export CSV</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={exportUrl("estimates", "excel", { status })} target="_blank" rel="noreferrer">Export Excel</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={exportUrl("estimates", "pdf", { status })} target="_blank" rel="noreferrer">Export PDF</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name or email…"
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
            {ESTIMATE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No estimates found" description="Estimates from the project estimator will appear here." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>
                    <button className="text-left" onClick={() => { setSelected(row); setDetailOpen(true); }}>
                      <p className="font-medium hover:underline">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </button>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">{row.serviceNames?.join(", ") || "—"}</TableCell>
                  <TableCell className="text-sm font-medium">{formatINR(row.totalCost)}</TableCell>
                  <TableCell className="text-sm">{row.timelineDays ? `${row.timelineDays} days` : row.timeline || "—"}</TableCell>
                  <TableCell>
                    <Select value={row.status} onValueChange={(v) => handleStatusChange(row._id, v)}>
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTIMATE_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <AssignedSelect row={row} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{timeAgo(row.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label="Actions">
                          ⋯
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelected(row); setDetailOpen(true); }}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleting(row)}>
                          Delete
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
            Page {meta.page} of {meta.pages} · {formatNumber(meta.total)} total
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Received {timeAgo(selected.createdAt)}</DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap gap-2 text-sm">
                <StatusBadge status={selected.status} />
                <span className="text-muted-foreground">{selected.email}</span>
                {selected.phone && <span className="text-muted-foreground">{selected.phone}</span>}
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Services</p>
                  <ul className="list-inside list-disc">
                    {selected.serviceNames?.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
                {selected.addons?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Add-ons</p>
                    <p>{selected.addons.join(", ")}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Total cost</p>
                  <p className="font-display text-2xl font-bold">{formatINR(selected.totalCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p>{selected.timelineDays ? `${selected.timelineDays} days` : selected.timeline || "—"}</p>
                </div>
                {selected.notes && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3">{selected.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete estimate?"
        description={deleting ? `This will permanently delete the estimate for ${deleting.name}.` : undefined}
        pending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
