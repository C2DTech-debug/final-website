"use client";

import * as React from "react";
import {
  Ban,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  MessageSquare,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCancelPayment,
  useCreatePayment,
  useCreatePaymentLink,
  useLeads,
  usePayment,
  usePayments,
  usePaymentStats,
  useResendPaymentLink,
  useSendPaymentLink,
} from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/lib/permissions";
import { PAYMENT_STATUSES, paymentStatusColor } from "@/constants";
import { PAYMENT_ACTION_LABELS, PAYMENT_STATUS_LABELS } from "@/types";
import type { Lead, Payment } from "@/types";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { cn, formatDateTime, formatRupees, timeAgo } from "@/lib/utils";

const PAGE_SIZE = 20;
const TERMINAL_STATUSES = ["paid", "failed", "expired", "cancelled"];

function canGenerate(p: Payment): boolean {
  return p.clientApproved && !TERMINAL_STATUSES.includes(p.status) && !p.razorpay.shortUrl;
}
function canSend(p: Payment): boolean {
  return p.status === "link_created";
}
function canResend(p: Payment): boolean {
  return p.status === "sent";
}
function canCancel(p: Payment): boolean {
  return !TERMINAL_STATUSES.includes(p.status);
}

function leadName(p: Payment): string {
  return p.leadSnapshot.name || (typeof p.lead === "object" && p.lead ? p.lead.name : "—");
}

function copyText(text: string, label = "Copied to clipboard") {
  navigator.clipboard?.writeText(text).then(() => toast.success(label)).catch(() => toast.error("Copy failed"));
}

// ---------- Stats ----------

function StatsCards() {
  const { data } = usePaymentStats();
  const s = data;

  const cards = [
    { label: "Total requests", value: s?.total ?? "—", icon: Wallet },
    { label: "Paid", value: s?.paid ?? "—", icon: CheckCircle2 },
    { label: "Outstanding", value: s?.outstanding ?? "—", icon: Send },
    { label: "Collected", value: s ? formatRupees(s.collectedPaise) : "—", icon: Wallet },
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

// ---------- Table ----------

function PaymentTable({
  payments,
  onOpen,
  onGenerate,
  onSend,
  onResend,
  onCancel,
}: {
  payments: Payment[];
  onOpen: (p: Payment) => void;
  onGenerate: (p: Payment) => void;
  onSend: (p: Payment) => void;
  onResend: (p: Payment) => void;
  onCancel: (p: Payment) => void;
}) {
  const user = useAuthStore((s) => s.user);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Approval</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p._id} className="cursor-pointer" onClick={() => onOpen(p)}>
            <TableCell>
              <p className="font-mono text-xs font-semibold">{p.paymentRef}</p>
              <p className="mt-0.5 max-w-[180px] truncate text-xs text-muted-foreground">{p.description || "—"}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm font-medium">{leadName(p)}</p>
              <p className="text-xs text-muted-foreground">{p.leadSnapshot.company || "—"}</p>
            </TableCell>
            <TableCell className="text-sm font-medium">{formatRupees(p.amountPaise)}</TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("whitespace-nowrap", paymentStatusColor(p.status))}>
                {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
              </Badge>
            </TableCell>
            <TableCell>
              {p.clientApproved ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Pending</span>
              )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Actions">⋯</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onOpen(p)}>View</DropdownMenuItem>
                  {canGenerate(p) && hasPermission(user, "payments:link_create") && (
                    <DropdownMenuItem onClick={() => onGenerate(p)}>
                      <Link2 className="mr-2 h-4 w-4" /> Generate link
                    </DropdownMenuItem>
                  )}
                  {canSend(p) && hasPermission(user, "payments:send_whatsapp") && (
                    <DropdownMenuItem onClick={() => onSend(p)}>
                      <Send className="mr-2 h-4 w-4" /> Send via WhatsApp
                    </DropdownMenuItem>
                  )}
                  {canResend(p) && hasPermission(user, "payments:resend_whatsapp") && (
                    <DropdownMenuItem onClick={() => onResend(p)}>
                      <RefreshCcw className="mr-2 h-4 w-4" /> Resend
                    </DropdownMenuItem>
                  )}
                  {p.razorpay.shortUrl && (
                    <DropdownMenuItem onClick={() => copyText(p.razorpay.shortUrl, "Payment link copied")}>
                      <Copy className="mr-2 h-4 w-4" /> Copy link
                    </DropdownMenuItem>
                  )}
                  {canCancel(p) && hasPermission(user, "payments:cancel") && (
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onCancel(p)}>
                      <Ban className="mr-2 h-4 w-4" /> Cancel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ---------- Create dialog ----------

function LeadPicker({
  selected,
  onSelect,
}: {
  selected: Lead | null;
  onSelect: (lead: Lead) => void;
}) {
  const [q, setQ] = React.useState("");
  const { data, isLoading } = useLeads({ q, limit: "20" });
  const leads = data?.data ?? [];

  return (
    <div className="space-y-2">
      <Label>Lead *</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search leads by name, phone, company…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border p-1.5">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-md" />)}
          </div>
        ) : leads.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">No leads found</p>
        ) : (
          leads.map((lead) => (
            <button
              key={lead._id}
              type="button"
              onClick={() => onSelect(lead)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                selected?._id === lead._id
                  ? "border-primary bg-primary/10"
                  : "border-transparent hover:bg-accent"
              )}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{lead.name || "Unnamed"}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {lead.leadId} · {lead.company || lead.email || lead.whatsapp || lead.phone || "—"}
                </span>
              </span>
              {selected?._id === lead._id && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function CreatePaymentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreatePayment();
  const [lead, setLead] = React.useState<Lead | null>(null);
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [clientApproved, setClientApproved] = React.useState(false);
  const [force, setForce] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setLead(null);
      setAmount("");
      setDescription("");
      setClientApproved(false);
      setForce(false);
    }
  }, [open]);

  const conflict = create.isError && create.error instanceof Error && (create.error as { code?: string }).code === "CONFLICT";

  const handleSubmit = async (forceCreate = false) => {
    if (!lead) {
      toast.error("Select a lead");
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 1) {
      toast.error("Amount must be at least ₹1");
      return;
    }
    try {
      await create.mutateAsync({
        leadId: lead._id,
        amount: amt,
        description: description.trim(),
        clientApproved,
        force: forceCreate,
      });
      toast.success("Payment request created");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) create.reset(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New payment request</DialogTitle>
          <DialogDescription>
            Create a payment request for a lead. A Razorpay link can be generated after the client approves the amount.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <LeadPicker selected={lead} onSelect={setLead} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                placeholder="0.00"
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value="INR" onValueChange={() => undefined}>
                <SelectTrigger disabled><SelectValue>INR</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              placeholder="e.g. Website redesign — 50% advance"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Switch checked={clientApproved} onCheckedChange={setClientApproved} aria-label="Client approved" />
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Client approved the amount</Label>
              <p className="text-xs text-muted-foreground">
                Confirm the client agreed to this amount. Required before a payment link can be generated.
              </p>
            </div>
          </div>
          {conflict && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">This lead already has an active payment request.</p>
              <p className="mt-1 text-xs text-muted-foreground">You can still create another one — both will stay active.</p>
              <Button size="sm" variant="outline" className="mt-2" disabled={create.isPending} onClick={() => handleSubmit(true)}>
                {create.isPending ? <Spinner /> : "Create anyway"}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={create.isPending}>Cancel</Button>
          <Button onClick={() => handleSubmit(false)} disabled={create.isPending}>
            {create.isPending ? <Spinner /> : "Create request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Detail sheet ----------

function DetailActions({ p }: { p: Payment }) {
  const user = useAuthStore((s) => s.user);
  const gen = useCreatePaymentLink();
  const send = useSendPaymentLink();
  const resend = useResendPaymentLink();

  const run = async (label: string, fn: () => Promise<{ razorpay?: { shortUrl?: string } }>) => {
    try {
      const result = await fn();
      toast.success(label);
      if (result.razorpay?.shortUrl) copyText(result.razorpay.shortUrl, "Payment link copied");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${label} failed`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {canGenerate(p) && hasPermission(user, "payments:link_create") && (
        <Button size="sm" disabled={gen.isPending} onClick={() => run("Payment link generated", () => gen.mutateAsync(p._id))}>
          {gen.isPending ? <Spinner /> : <Link2 className="mr-2 h-4 w-4" />} Generate link
        </Button>
      )}
      {canSend(p) && hasPermission(user, "payments:send_whatsapp") && (
        <Button size="sm" disabled={send.isPending} onClick={() => run("Payment link sent", () => send.mutateAsync(p._id))}>
          {send.isPending ? <Spinner /> : <Send className="mr-2 h-4 w-4" />} Send via WhatsApp
        </Button>
      )}
      {canResend(p) && hasPermission(user, "payments:resend_whatsapp") && (
        <Button size="sm" disabled={resend.isPending} onClick={() => run("Payment link resent", () => resend.mutateAsync(p._id))}>
          {resend.isPending ? <Spinner /> : <RefreshCcw className="mr-2 h-4 w-4" />} Resend
        </Button>
      )}
      {p.razorpay.shortUrl && (
        <Button size="sm" variant="outline" onClick={() => copyText(p.razorpay.shortUrl, "Payment link copied")}>
          <Copy className="mr-2 h-4 w-4" /> Copy link
        </Button>
      )}
    </div>
  );
}

function PaymentDetailSheet({ paymentId, open, onOpenChange }: { paymentId: string | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: p, isLoading } = usePayment(paymentId ?? "");
  const user = useAuthStore((s) => s.user);
  const cancel = useCancelPayment();

  const handleCancel = async () => {
    if (!p) return;
    try {
      await cancel.mutateAsync(p._id);
      toast.success("Payment request cancelled");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {isLoading || !p ? (
          <div className="space-y-3 pt-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : (
          <>
            <SheetHeader className="pb-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <SheetTitle className="font-mono">{p.paymentRef}</SheetTitle>
                <Badge variant="outline" className={cn("whitespace-nowrap", paymentStatusColor(p.status))}>
                  {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {leadName(p)} · {formatRupees(p.amountPaise)} {p.currency}
              </p>
            </SheetHeader>

            <div className="space-y-4">
              <DetailActions p={p} />

              <div className="rounded-xl border p-4">
                <h3 className="text-sm font-semibold">Client</h3>
                <dl className="mt-2 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs text-muted-foreground">Name</dt><dd>{p.leadSnapshot.name || "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Company</dt><dd>{p.leadSnapshot.company || "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Email</dt><dd>{p.leadSnapshot.email || "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Phone</dt><dd>{p.leadSnapshot.phone || "—"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">WhatsApp</dt><dd>{p.leadSnapshot.whatsapp || "—"}</dd></div>
                  {typeof p.lead === "object" && p.lead && (
                    <div><dt className="text-xs text-muted-foreground">Lead ID</dt><dd>{p.lead.leadId}</dd></div>
                  )}
                </dl>
              </div>

              <div className="rounded-xl border p-4">
                <h3 className="text-sm font-semibold">Request</h3>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Amount</dt><dd className="font-medium">{formatRupees(p.amountPaise)}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Description</dt><dd className="text-right">{p.description || "—"}</dd></div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Client approval</dt>
                    <dd>
                      {p.clientApproved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                          {p.approvedAt ? ` · ${formatDateTime(p.approvedAt)}` : ""}
                        </span>
                      ) : "Pending"}
                    </dd>
                  </div>
                </dl>
              </div>

              {p.razorpay.shortUrl && (
                <div className="rounded-xl border p-4">
                  <h3 className="text-sm font-semibold">Razorpay link</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 text-xs">{p.razorpay.shortUrl}</code>
                    <Button variant="outline" size="icon" onClick={() => copyText(p.razorpay.shortUrl, "Payment link copied")} aria-label="Copy link">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" asChild aria-label="Open link">
                      <a href={p.razorpay.shortUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                    </Button>
                  </div>
                  {p.razorpay.linkId && <p className="mt-2 font-mono text-xs text-muted-foreground">Razorpay ID: {p.razorpay.linkId}</p>}
                </div>
              )}

              {p.status === "paid" && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Payment received</h3>
                  <dl className="mt-2 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Amount paid</dt><dd className="font-medium">{formatRupees(p.payment.amountPaidPaise || p.amountPaise)}</dd></div>
                    {p.payment.method && <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Method</dt><dd>{p.payment.method}</dd></div>}
                    {p.payment.razorpayPaymentId && <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Payment ID</dt><dd className="font-mono text-xs">{p.payment.razorpayPaymentId}</dd></div>}
                    {p.payment.paidAt && <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Paid at</dt><dd>{formatDateTime(p.payment.paidAt)}</dd></div>}
                    {p.payment.note && <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Note</dt><dd className="text-right">{p.payment.note}</dd></div>}
                  </dl>
                </div>
              )}

              {p.whatsapp.messageId && (
                <div className="rounded-xl border p-4">
                  <h3 className="text-sm font-semibold">WhatsApp</h3>
                  <dl className="mt-2 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Sent to</dt><dd>{p.whatsapp.sentTo || "—"}</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Status</dt><dd>{p.whatsapp.status || "—"}</dd></div>
                    {p.whatsapp.messageId && <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Message ID</dt><dd className="font-mono text-xs">{p.whatsapp.messageId}</dd></div>}
                    {p.whatsapp.error && <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Error</dt><dd className="text-right text-destructive">{p.whatsapp.error}</dd></div>}
                  </dl>
                </div>
              )}

              <div className="rounded-xl border p-4">
                <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" /> Timeline
                </h3>
                <ol className="relative ml-2 space-y-4 border-l border-muted pl-5">
                  {p.timeline.map((t) => (
                    <li key={t._id} className="relative">
                      <span className="absolute -left-[26px] top-1 h-2 w-2 rounded-full bg-primary/60" />
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{PAYMENT_ACTION_LABELS[t.action] ?? t.action}</p>
                        <span className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/70">by {t.byName || "System"}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {canCancel(p) && hasPermission(user, "payments:cancel") && (
                <div className="pt-1">
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => onOpenChange(false)}>
                    <Ban className="mr-2 h-4 w-4" /> Cancel request
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ---------- Page ----------

export default function AdminPaymentsPage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [cancelling, setCancelling] = React.useState<Payment | null>(null);

  const params: Record<string, string> = { page: String(page), limit: String(PAGE_SIZE), q, status };
  const { data, isLoading } = usePayments(params);
  const gen = useCreatePaymentLink();
  const send = useSendPaymentLink();
  const resend = useResendPaymentLink();
  const cancel = useCancelPayment();

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const handleOpen = (p: Payment) => {
    setSelectedId(p._id);
    setDetailOpen(true);
  };

  const runAction = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      toast.success(label);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${label} failed`);
    }
  };

  const handleCancel = async () => {
    if (!cancelling) return;
    try {
      await cancel.mutateAsync(cancelling._id);
      toast.success("Payment request cancelled");
      setCancelling(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payments"
        description="Create payment requests, generate Razorpay links and send them via WhatsApp."
        actions={
          hasPermission(user, "payments:create") ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New request
            </Button>
          ) : undefined
        }
      />

      <StatsCards />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search ref, client, phone…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          value={status || "__all__"}
          onValueChange={(v) => { setStatus(v === "__all__" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No payments found" description="Try adjusting your filters, or create a new request." />
        ) : (
          <PaymentTable
            payments={rows}
            onOpen={handleOpen}
            onGenerate={(p) => runAction("Payment link generated", () => gen.mutateAsync(p._id))}
            onSend={(p) => runAction("Payment link sent", () => send.mutateAsync(p._id))}
            onResend={(p) => runAction("Payment link resent", () => resend.mutateAsync(p._id))}
            onCancel={setCancelling}
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

      <PaymentDetailSheet paymentId={selectedId} open={detailOpen} onOpenChange={setDetailOpen} />
      <CreatePaymentDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={Boolean(cancelling)}
        onOpenChange={(o) => !o && setCancelling(null)}
        title="Cancel payment request?"
        description={cancelling ? `This will cancel ${cancelling.paymentRef}. The client can no longer pay through it.` : undefined}
        pending={cancel.isPending}
        onConfirm={handleCancel}
      />
    </div>
  );
}
