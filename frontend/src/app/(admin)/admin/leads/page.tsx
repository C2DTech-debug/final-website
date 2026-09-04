"use client";

import * as React from "react";
import {
  CalendarClock,
  Download,
  Edit,
  FileUp,
  Globe,
  GripVertical,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  useAddLeadTimeline,
  useAdminUserOptions,
  useAssignLead,
  useCreateLead,
  useDeleteLead,
  useDeleteLeadNote,
  useImportLeads,
  useLead,
  useLeadDuplicates,
  useLeadKanban,
  useLeadNotes,
  useLeadStats,
  useLeads,
  useMergeLeads,
  useUpdateLead,
  useUpdateLeadStatus,
  exportUrl,
} from "@/hooks/useAdmin";
import type { DuplicateGroup, Lead } from "@/types";
import { LEAD_PRIORITY_LABELS, LEAD_SOURCE_LABELS, LEAD_STATUS, LEAD_STATUS_LABELS } from "@/types";
import { LEAD_STATUSES, LEAD_PRIORITIES, LEAD_SOURCES } from "@/constants";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { cn, formatDate, formatDateTime, initials, timeAgo } from "@/lib/utils";

const PAGE_SIZE = 20;

function assignedName(lead: Lead): string {
  const a = lead.assignedTo;
  if (!a) return "Unassigned";
  return typeof a === "string" ? "—" : a.name;
}

function assignedId(lead: Lead): string {
  const a = lead.assignedTo;
  return typeof a === "object" && a ? a._id : "";
}

function statusColor(status: string): string {
  return LEAD_STATUSES.find((s) => s.value === status)?.color || "bg-muted text-muted-foreground";
}

function priorityColor(priority: string): string {
  return LEAD_PRIORITIES.find((p) => p.value === priority)?.color || "bg-muted text-muted-foreground";
}

function formatLeadSource(lead: Lead): string {
  const baseLabel = LEAD_SOURCE_LABELS[lead.source] ?? lead.source;
  const creator = typeof lead.createdBy === "object" && lead.createdBy ? lead.createdBy.name : lead.createdByName;
  if (lead.source === "manual") {
    return creator ? `Manual (by ${creator})` : "Manual";
  }
  return creator ? `${baseLabel} (by ${creator})` : baseLabel;
}

// ---------- Stats ----------

function StatsCards() {
  const { data } = useLeadStats();
  const stats = data;
  const won = stats?.byStatus?.find((s) => s._id === "won")?.count ?? 0;
  const followUps = stats?.upcomingFollowUps?.length ?? 0;

  const cards = [
    { label: "Total leads", value: stats?.total ?? "—", icon: Users },
    { label: "Won", value: won, icon: TrendingUp },
    { label: "Revenue forecast", value: stats?.revenueForecast ? `₹${Number(stats.revenueForecast).toLocaleString("en-IN")}` : "—", icon: Wallet },
    { label: "Follow-ups due", value: followUps, icon: CalendarClock },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <c.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="font-display text-xl font-bold">{c.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Table view ----------

function LeadTable({
  leads,
  onOpen,
  onEdit,
  onDelete,
  onStatus,
}: {
  leads: Lead[];
  onOpen: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onStatus: (id: string, status: string) => void;
}) {
  const { data: users } = useAdminUserOptions();
  const assign = useAssignLead();

  const handleAssign = async (id: string, value: string) => {
    try {
      await assign.mutateAsync({ id, assignedTo: value === "__unassigned__" ? "" : value });
      toast.success("Lead assigned");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assign failed");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lead</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Follow-up</TableHead>
          <TableHead>Received</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead._id} className="cursor-pointer" onClick={() => onOpen(lead)}>
            <TableCell>
              <p className="font-medium">{lead.name}</p>
              <p className="text-xs text-muted-foreground">
                {lead.leadId} · {lead.email || lead.phone || "—"} · <span className="font-medium text-foreground/80">{formatLeadSource(lead)}</span>
              </p>
            </TableCell>
            <TableCell className="text-sm">{lead.service || "—"}</TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("whitespace-nowrap", priorityColor(lead.priority))}>
                {LEAD_PRIORITY_LABELS[lead.priority] ?? lead.priority}
              </Badge>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Select value={lead.status} onValueChange={(v) => onStatus(lead._id, v)}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>{LEAD_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Select value={assignedId(lead)} onValueChange={(v) => handleAssign(lead._id, v)}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">Unassigned</SelectItem>
                  {users?.map((u) => (
                    <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {lead.followUpDate ? formatDate(lead.followUpDate) : "—"}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{timeAgo(lead.createdAt)}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Actions">⋯</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onOpen(lead)}>View details</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(lead)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit lead
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(lead)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ---------- Kanban ----------

function KanbanBoard({ onOpen }: { onOpen: (lead: Lead) => void }) {
  const { data: columns, isLoading } = useLeadKanban();
  const updateStatus = useUpdateLeadStatus();

  const handleMove = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Move failed");
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {(columns ?? []).map((col) => (
        <div key={col.status} className="w-72 shrink-0 rounded-xl border bg-muted/40">
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", statusColor(col.status).split(" ")[0])} />
              <span className="text-sm font-medium">{LEAD_STATUS_LABELS[col.status] ?? col.status}</span>
            </div>
            <Badge variant="outline">{col.leads.length}</Badge>
          </div>
          <div className="space-y-2 px-2 pb-3">
            {col.leads.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">No leads</p>
            )}
            {col.leads.map((lead) => (
              <div
                key={lead._id}
                className="cursor-grab rounded-lg border bg-card p-3 transition-shadow hover:shadow-md"
                onClick={() => onOpen(lead)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{lead.name}</p>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", priorityColor(lead.priority))}>
                    {LEAD_PRIORITY_LABELS[lead.priority] ?? lead.priority}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{lead.email || lead.phone || "—"}</p>
                {lead.service && <p className="mt-1 text-xs text-muted-foreground">{lead.service}</p>}
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="truncate max-w-[130px]">{formatLeadSource(lead)}</span>
                  <span>{timeAgo(lead.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Detail sheet ----------

function LeadDetailSheet({
  leadId,
  open,
  onOpenChange,
  onEdit,
}: {
  leadId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit?: (lead: Lead) => void;
}) {
  const { data: lead, isLoading } = useLead(leadId ?? "");
  const { data: users } = useAdminUserOptions();
  const updateStatus = useUpdateLeadStatus();
  const updateLead = useUpdateLead();
  const assign = useAssignLead();
  const addNote = useLeadNotes();
  const delNote = useDeleteLeadNote();
  const addTimeline = useAddLeadTimeline();
  const [note, setNote] = React.useState("");
  const [timelineDesc, setTimelineDesc] = React.useState("");
  const [followUp, setFollowUp] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setNote("");
      setTimelineDesc("");
      setFollowUp(lead?.followUpDate ? new Date(lead.followUpDate).toISOString().slice(0, 16) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, leadId]);

  const handleStatus = async (status: string) => {
    if (!lead) return;
    try {
      await updateStatus.mutateAsync({ id: lead._id, status });
      toast.success("Status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleAssign = async (value: string) => {
    if (!lead) return;
    try {
      await assign.mutateAsync({ id: lead._id, assignedTo: value === "__unassigned__" ? "" : value });
      toast.success("Lead assigned");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assign failed");
    }
  };

  const handleFollowUp = async () => {
    if (!lead) return;
    try {
      await updateLead.mutateAsync({
        id: lead._id,
        body: { followUpDate: followUp ? new Date(followUp).toISOString() : null },
      });
      toast.success("Follow-up saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleAddNote = async () => {
    if (!lead || !note.trim()) return;
    try {
      await addNote.mutateAsync({ id: lead._id, body: { body: note.trim() } });
      setNote("");
      toast.success("Note added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!lead) return;
    try {
      await delNote.mutateAsync({ id: lead._id, noteId });
      toast.success("Note deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleAddTimeline = async () => {
    if (!lead || !timelineDesc.trim()) return;
    try {
      await addTimeline.mutateAsync({ id: lead._id, body: { action: "note", description: timelineDesc.trim() } });
      setTimelineDesc("");
      toast.success("Timeline entry added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add entry");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        {isLoading || !lead ? (
          <div className="space-y-3 pt-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : (
          <>
            <SheetHeader className="pb-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <SheetTitle className="text-xl font-bold">{lead.name}</SheetTitle>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs font-medium"
                      onClick={() => onEdit(lead)}
                    >
                      <Pencil className="h-3.5 w-3.5 text-primary" /> Edit lead
                    </Button>
                  )}
                  <Badge variant="outline" className="text-xs">{lead.leadId}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Select value={lead.status} onValueChange={handleStatus}>
                  <SelectTrigger className={cn("h-7 w-fit gap-2 text-xs", statusColor(lead.status))}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUS.map((s) => (
                      <SelectItem key={s} value={s}>{LEAD_STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className={cn("whitespace-nowrap", priorityColor(lead.priority))}>
                  {LEAD_PRIORITY_LABELS[lead.priority] ?? lead.priority}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-4">
              <div className="grid gap-2.5 rounded-xl border bg-muted/20 p-4 text-sm">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs font-semibold text-foreground/80 min-w-[50px]">Email:</span>
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="font-medium text-foreground hover:underline">
                      {lead.email}
                    </a>
                  ) : (
                    <span className="italic text-muted-foreground/70">No email provided</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs font-semibold text-foreground/80 min-w-[50px]">Phone:</span>
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`} className="font-medium text-foreground hover:underline">
                      {lead.phone}
                    </a>
                  ) : (
                    <span className="italic text-muted-foreground/70">No phone provided</span>
                  )}
                </div>
                {lead.whatsapp && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <MessageSquare className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-xs font-semibold text-foreground/80 min-w-[50px]">WhatsApp:</span>
                    <a
                      href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground hover:underline"
                    >
                      {lead.whatsapp}
                    </a>
                  </div>
                )}
                {lead.website && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Globe className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-xs font-semibold text-foreground/80 min-w-[50px]">Website:</span>
                    <a
                      href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground hover:underline truncate"
                    >
                      {lead.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs font-semibold text-foreground/80 min-w-[50px]">Location:</span>
                  <span>
                    {[lead.address, lead.city, lead.state, lead.country].filter(Boolean).join(", ") || (
                      <span className="italic text-muted-foreground/70">No location specified</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl border p-4 text-sm sm:grid-cols-3">
                <div><p className="text-xs text-muted-foreground">Company</p><p className="font-medium">{lead.company || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Service</p><p className="font-medium">{lead.service || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Budget</p><p className="font-medium">{lead.budget || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Source</p><p className="font-medium">{formatLeadSource(lead)}</p></div>
                <div><p className="text-xs text-muted-foreground">Business type</p><p className="font-medium">{lead.businessType || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(lead.createdAt)}</p></div>
              </div>

              {lead.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{tag}</span>
                  ))}
                </div>
              )}

              <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">Owner</Label>
                  <Select value={assignedId(lead)} onValueChange={handleAssign}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__unassigned__">Unassigned</SelectItem>
                      {users?.map((u) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Follow-up</Label>
                  <div className="flex gap-2">
                    <Input type="datetime-local" className="h-9 text-xs" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
                    <Button size="sm" variant="outline" className="h-9" onClick={handleFollowUp}>Save</Button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internal notes</p>
                <div className="space-y-2">
                  {(lead.notes ?? []).length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
                  {(lead.notes ?? []).map((n) => (
                    <div key={n._id} className="rounded-lg bg-muted/50 p-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{n.byName || "System"}</span>
                        <div className="flex items-center gap-2">
                          <span>{timeAgo(n.createdAt)}</span>
                          <button className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteNote(n._id)} aria-label="Delete note">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{n.body}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input className="h-9 text-sm" placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} />
                  <Button size="sm" className="h-9" onClick={handleAddNote} disabled={addNote.isPending || !note.trim()}>
                    {addNote.isPending ? <Spinner /> : "Add"}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timeline</p>
                <ol className="relative space-y-4 border-l pl-4">
                  {(lead.timeline ?? []).slice().reverse().map((entry) => (
                    <li key={entry._id} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm font-medium">{entry.action.replace(/_/g, " ")}</p>
                      {entry.description && <p className="text-xs text-muted-foreground">{entry.description}</p>}
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{entry.byName} · {formatDateTime(entry.createdAt)}</p>
                    </li>
                  ))}
                  {(lead.timeline ?? []).length === 0 && <li className="text-sm text-muted-foreground">No activity yet.</li>}
                </ol>
                <div className="mt-3 flex gap-2">
                  <Input className="h-9 text-sm" placeholder="Log an event…" value={timelineDesc} onChange={(e) => setTimelineDesc(e.target.value)} />
                  <Button size="sm" variant="outline" className="h-9" onClick={handleAddTimeline} disabled={addTimeline.isPending || !timelineDesc.trim()}>
                    Log
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ---------- Duplicates ----------

function DuplicatesPanel() {
  const { data, isLoading } = useLeadDuplicates();
  const merge = useMergeLeads();
  const [primary, setPrimary] = React.useState<Record<string, string>>({});

  const handleMerge = async (group: DuplicateGroup) => {
    const pid = primary[group.group[0]?._id] || group.group[0]?._id;
    if (!pid) return;
    const secondaryIds = group.group.filter((l) => l._id !== pid).map((l) => l._id);
    if (secondaryIds.length === 0) return;
    try {
      await merge.mutateAsync({ primaryId: pid, secondaryIds });
      toast.success("Duplicates merged");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Merge failed");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No duplicates found" description="We automatically group leads that share an email, phone or name." />;
  }

  return (
    <div className="space-y-3">
      {data.map((group, gi) => {
        const pid = primary[group.group[0]?._id] || group.group[0]?._id;
        return (
          <div key={gi} className="rounded-xl border p-4">
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="outline">Matched on {group.matchedOn}</Badge>
              <Button size="sm" variant="outline" onClick={() => handleMerge(group)} disabled={merge.isPending}>
                Merge into primary
              </Button>
            </div>
            <div className="space-y-2">
              {group.group.map((lead) => (
                <label key={lead._id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <input
                    type="radio"
                    name={`primary-${gi}`}
                    checked={pid === lead._id}
                    onChange={() => setPrimary((p) => ({ ...p, [group.group[0]?._id]: lead._id }))}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.leadId} · {lead.email || lead.phone || "—"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Edit lead ----------

function EditLeadDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const update = useUpdateLead();
  const [form, setForm] = React.useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    businessType: "",
    website: "",
    service: "",
    budget: "",
    priority: "medium",
    source: "manual",
    status: "new",
  });

  React.useEffect(() => {
    if (lead && open) {
      setForm({
        name: lead.name || "",
        company: lead.company || "",
        email: lead.email || "",
        phone: lead.phone || "",
        whatsapp: lead.whatsapp || "",
        address: lead.address || "",
        city: lead.city || "",
        state: lead.state || "",
        country: lead.country || "India",
        businessType: lead.businessType || "",
        website: lead.website || "",
        service: lead.service || "",
        budget: lead.budget || "",
        priority: lead.priority || "medium",
        source: lead.source || "manual",
        status: lead.status || "new",
      });
    }
  }, [lead, open]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!lead) return;
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await update.mutateAsync({
        id: lead._id,
        body: form,
      });
      toast.success("Lead details updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            Edit Lead · {lead?.leadId}
          </DialogTitle>
          <DialogDescription>Update contact information, company email, and deal details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Lead / Contact Name *</Label>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. Kuchice Anna Nagar" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Company Name</Label>
            <Input value={form.company} onChange={set("company")} placeholder="e.g. Kuchice Pvt Ltd" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Company / Contact Email</Label>
            <Input type="email" value={form.email} onChange={set("email")} placeholder="e.g. info@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Phone Number</Label>
            <Input value={form.phone} onChange={set("phone")} placeholder="e.g. +91 91501 52058" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">WhatsApp Number</Label>
            <Input value={form.whatsapp} onChange={set("whatsapp")} placeholder="e.g. +91 91501 52058" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Service Required</Label>
            <Input value={form.service} onChange={set("service")} placeholder="e.g. Website Development" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Budget (₹)</Label>
            <Input value={form.budget} onChange={set("budget")} placeholder="e.g. ₹50,000" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>{LEAD_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Business Type</Label>
            <Input value={form.businessType} onChange={set("businessType")} placeholder="e.g. Retail / Restaurant" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Website</Label>
            <Input value={form.website} onChange={set("website")} placeholder="https://..." />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Address / Street</Label>
            <Input value={form.address} onChange={set("address")} placeholder="e.g. Anna Nagar 2nd Avenue" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">City</Label>
            <Input value={form.city} onChange={set("city")} placeholder="e.g. Chennai" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">State</Label>
            <Input value={form.state} onChange={set("state")} placeholder="e.g. Tamil Nadu" />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={update.isPending}>
            {update.isPending ? <Spinner /> : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Create lead ----------

function CreateLeadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateLead();
  const [form, setForm] = React.useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    businessType: "",
    website: "",
    service: "",
    budget: "",
    priority: "medium",
    source: "manual",
    status: "new",
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        whatsapp: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        businessType: "",
        website: "",
        service: "",
        budget: "",
        priority: "medium",
        source: "manual",
        status: "new",
      });
    }
  }, [open]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await create.mutateAsync({ ...form, tags: [] });
      toast.success("Lead created");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            New Lead
          </DialogTitle>
          <DialogDescription>Add a lead manually with contact info and company email.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Lead / Contact Name *</Label>
            <Input value={form.name} placeholder="e.g. Kuchice Anna Nagar" onChange={set("name")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Company Name</Label>
            <Input value={form.company} placeholder="e.g. Kuchice Pvt Ltd" onChange={set("company")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Company / Contact Email</Label>
            <Input type="email" value={form.email} placeholder="e.g. info@company.com" onChange={set("email")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Phone Number</Label>
            <Input value={form.phone} placeholder="e.g. +91 91501 52058" onChange={set("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">WhatsApp Number</Label>
            <Input value={form.whatsapp} placeholder="e.g. +91 91501 52058" onChange={set("whatsapp")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Service Required</Label>
            <Input value={form.service} placeholder="e.g. Website Development" onChange={set("service")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Budget (₹)</Label>
            <Input value={form.budget} placeholder="e.g. ₹50,000" onChange={set("budget")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
              <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Source</Label>
            <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
              <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{LEAD_SOURCE_LABELS[s] ?? s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Business Type</Label>
            <Input value={form.businessType} placeholder="e.g. Retail / Restaurant" onChange={set("businessType")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Website</Label>
            <Input value={form.website} placeholder="https://..." onChange={set("website")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Address / Street</Label>
            <Input value={form.address} placeholder="e.g. Anna Nagar 2nd Avenue" onChange={set("address")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">City</Label>
            <Input value={form.city} placeholder="Chennai" onChange={set("city")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">State</Label>
            <Input value={form.state} placeholder="Tamil Nadu" onChange={set("state")} />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={create.isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={create.isPending}>
            {create.isPending ? <Spinner /> : "Create lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Page ----------

export default function AdminLeadsPage() {
  const [view, setView] = React.useState<"table" | "kanban">("table");
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<string>("");
  const [priority, setPriority] = React.useState<string>("");
  const [source, setSource] = React.useState<string>("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [editingLead, setEditingLead] = React.useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Lead | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const params: Record<string, string> = { page: String(page), limit: String(PAGE_SIZE), q, status, priority, source };
  const { data, isLoading } = useLeads(params);
  const del = useDeleteLead();
  const updateStatus = useUpdateLeadStatus();
  const importLeads = useImportLeads();

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const handleOpen = (lead: Lead) => {
    setSelectedId(lead._id);
    setDetailOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting._id);
      toast.success("Lead deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleStatus = async (id: string, value: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: value });
      toast.success(`Moved to ${LEAD_STATUS_LABELS[value]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleImport = async (file?: File | null) => {
    if (!file) return;
    try {
      const result = await importLeads.mutateAsync(file);
      toast.success(`Imported ${result.imported} lead(s), skipped ${result.skipped}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    }
  };

  const filters: { value: string; set: (v: string) => void; placeholder: string; options: { value: string; label: string }[]; all: string }[] = [
    {
      value: status,
      set: (v) => { setStatus(v); setPage(1); },
      placeholder: "All statuses",
      all: "__all__",
      options: LEAD_STATUS.map((s) => ({ value: s, label: LEAD_STATUS_LABELS[s] })),
    },
    {
      value: priority,
      set: (v) => { setPriority(v); setPage(1); },
      placeholder: "All priorities",
      all: "__all__",
      options: LEAD_PRIORITIES.map((p) => ({ value: p.value, label: p.label })),
    },
    {
      value: source,
      set: (v) => { setSource(v); setPage(1); },
      placeholder: "All sources",
      all: "__all__",
      options: LEAD_SOURCES.map((s) => ({ value: s, label: LEAD_SOURCE_LABELS[s] ?? s })),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Leads"
        description="Your full lead pipeline — capture, qualify and close."
        actions={
          <>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => handleImport(e.target.files?.[0])} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={importLeads.isPending}>
              <FileUp className="h-4 w-4" /> {importLeads.isPending ? "Importing…" : "Import"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href={exportUrl("leads", "csv", { status })} target="_blank" rel="noreferrer">Export CSV</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={exportUrl("leads", "excel", { status })} target="_blank" rel="noreferrer">Export Excel</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={exportUrl("leads", "pdf", { status })} target="_blank" rel="noreferrer">Export PDF</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New lead
            </Button>
          </>
        }
      />

      <StatsCards />

      <Tabs value={view} onValueChange={(v) => setView(v as "table" | "kanban")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, email, phone…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <Select key={f.placeholder} value={f.value || f.all} onValueChange={(v) => f.set(v === f.all ? "" : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={f.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={f.all}>{f.placeholder}</SelectItem>
                  {f.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="table" className="space-y-4">
          <div className="rounded-xl border">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
              </div>
            ) : rows.length === 0 ? (
              <EmptyState title="No leads found" description="Try adjusting your filters, or add a new lead." />
            ) : (
              <LeadTable
                leads={rows}
                onOpen={handleOpen}
                onEdit={handleEdit}
                onDelete={setDeleting}
                onStatus={handleStatus}
              />
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
        </TabsContent>

        <TabsContent value="kanban">
          <KanbanBoard onOpen={handleOpen} />
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Potential duplicates</h2>
        <DuplicatesPanel />
      </div>

      <LeadDetailSheet
        leadId={selectedId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(lead) => {
          setEditingLead(lead);
        }}
      />
      <CreateLeadDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditLeadDialog
        lead={editingLead}
        open={Boolean(editingLead)}
        onOpenChange={(o) => !o && setEditingLead(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete lead?"
        description={deleting ? `This will permanently delete ${deleting.name} and all its notes.` : undefined}
        pending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
