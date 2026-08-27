"use client";

import * as React from "react";
import {
  FileSignature,
  Plus,
  Search,
  Download,
  Share2,
  MessageSquare,
  Eye,
  Pencil,
  FileCheck,
  Ban,
  Copy,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { AgreementDeleteDialog } from "@/components/admin/agreement-delete-dialog";
import { downloadAdminAgreementPdf } from "@/lib/pdfDownload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AgreementFormDialog } from "@/components/admin/agreement-form-dialog";
import { AgreementDetailSheet } from "@/components/admin/agreement-detail-sheet";
import {
  useAgreements,
  useAgreementStats,
  useDeleteAgreement,
  useGenerateAgreementLink,
  useCreateAgreementVersion,
} from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/lib/permissions";
import { AGREEMENT_STATUSES, agreementStatusColor } from "@/constants";
import { AGREEMENT_STATUS_LABELS, type Agreement } from "@/types";
import { cn, formatDateTime, formatRupees, timeAgo } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 20;

function StatsCards() {
  const { data: stats } = useAgreementStats();

  const cards = [
    { label: "Total Agreements", value: stats?.total ?? "—", icon: FileSignature },
    { label: "Signed & Locked", value: stats?.signed ?? "—", icon: CheckCircle2 },
    { label: "In Review / Sent", value: (stats?.sent || 0) + (stats?.viewed || 0), icon: Clock },
    { label: "Signed Value", value: stats ? formatRupees((stats.signedValue || 0) * 100) : "—", icon: Coins },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border bg-card p-4 shadow-sm">
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

export default function AdminAgreementsPage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingAgreement, setEditingAgreement] = React.useState<Agreement | null>(null);
  const [deletingAgreement, setDeletingAgreement] = React.useState<Agreement | null>(null);

  const params: Record<string, string> = {
    page: String(page),
    limit: String(PAGE_SIZE),
    q,
    status,
  };

  const { data, isLoading } = useAgreements(params);
  const deleteAgreement = useDeleteAgreement();
  const generateLink = useGenerateAgreementLink();
  const createVersion = useCreateAgreementVersion();

  const agreements = data?.data ?? [];
  const meta = data?.meta;

  const copyToClipboard = (text: string, label = "Copied to clipboard") => {
    navigator.clipboard?.writeText(text);
    toast.success(label);
  };

  const getPublicSigningUrl = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://c2dtech.com";
    return `${origin}/agreement/${token}`;
  };

  const handleOpenDetail = (agr: Agreement) => {
    setSelectedId(agr._id);
    setDetailOpen(true);
  };

  const handleCreateNew = () => {
    setEditingAgreement(null);
    setFormOpen(true);
  };

  const handleEdit = (agr: Agreement) => {
    if (agr.status === "signed") {
      toast.error("Signed agreements are immutable. Create a new version to modify.");
      return;
    }
    setEditingAgreement(agr);
    setFormOpen(true);
  };

  const handleWhatsAppShare = (agr: Agreement) => {
    const url = getPublicSigningUrl(agr.publicToken);
    const cleanPhone = agr.client.phone.replace(/[^0-9]/g, "");
    const message = `Hello ${agr.client.name},

Your agreement for ${agr.project.name} is ready for review and electronic signing.

Please review the agreement using the secure link below:
${url}

Regards,
${agr.developer.name || "Aravindar C"}
${agr.developer.companyName || "C2D Tech"}
${agr.developer.phone || "+91 7904006320"}`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const handleNativeShare = async (agr: Agreement) => {
    const url = getPublicSigningUrl(agr.publicToken);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Agreement - ${agr.project.name}`,
          text: `Please review and electronically sign the agreement for ${agr.project.name}`,
          url,
        });
        toast.success("Shared successfully");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(url, "Agreement signing link copied!");
        }
      }
    } else {
      copyToClipboard(url, "Agreement signing link copied!");
    }
  };

  const handleDownloadPdf = (agr: Agreement) => {
    downloadAdminAgreementPdf(agr._id, agr.agreementNumber);
  };

  const handleDelete = async () => {
    if (!deletingAgreement) return;
    try {
      await deleteAgreement.mutateAsync(deletingAgreement._id);
      toast.success(
        deletingAgreement.status === "signed"
          ? "Signed agreement permanently deleted"
          : "Agreement draft deleted"
      );
      setDeletingAgreement(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete agreement");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Client Agreements & eSign"
        description="Create, customize, preview and share client contracts with electronic acceptance and audit trails."
        actions={
          hasPermission(user, "agreements:create") ? (
            <Button size="sm" onClick={handleCreateNew}>
              <Plus className="mr-1.5 h-4 w-4" /> New Agreement
            </Button>
          ) : undefined
        }
      />

      <StatsCards />

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 text-xs"
            placeholder="Search agreement #, client, phone, project…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={status || "__all__"}
          onValueChange={(v) => {
            setStatus(v === "__all__" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44 text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {AGREEMENT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Agreements Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : agreements.length === 0 ? (
          <EmptyState
            title="No agreements found"
            description="Create your first client agreement or adjust search filters."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agreement Ref</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created / Signed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((agr) => (
                <TableRow
                  key={agr._id}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                  onClick={() => handleOpenDetail(agr)}
                >
                  <TableCell>
                    <p className="font-mono text-xs font-semibold text-foreground">
                      {agr.agreementNumber}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Version {agr.version}</p>
                  </TableCell>

                  <TableCell>
                    <p className="text-xs font-medium text-foreground">{agr.client.name}</p>
                    <p className="text-[11px] text-muted-foreground">{agr.client.phone}</p>
                  </TableCell>

                  <TableCell>
                    <p className="max-w-[200px] truncate text-xs font-medium text-foreground">
                      {agr.project.name}
                    </p>
                    <p className="max-w-[200px] truncate text-[11px] text-muted-foreground">
                      {agr.agreementDetails.title}
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="text-xs font-semibold text-foreground">
                      {formatRupees(agr.project.totalAmount * 100)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Adv: {formatRupees(agr.project.advanceAmount * 100)} ({agr.project.advancePercentage}%)
                    </p>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("whitespace-nowrap text-xs", agreementStatusColor(agr.status))}
                    >
                      {AGREEMENT_STATUS_LABELS[agr.status] ?? agr.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {agr.signing?.signedAt ? (
                      <div>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">Signed</span>
                        <p className="text-[11px]">{timeAgo(agr.signing.signedAt)}</p>
                      </div>
                    ) : (
                      <div>
                        <span>Created</span>
                        <p className="text-[11px]">{timeAgo(agr.createdAt)}</p>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                        title="Send via WhatsApp"
                        onClick={() => handleWhatsAppShare(agr)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        title="Share / Copy Link"
                        onClick={() => handleNativeShare(agr)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        title="Download PDF"
                        onClick={() => handleDownloadPdf(agr)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            ⋯
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 text-xs">
                          <DropdownMenuItem onClick={() => handleOpenDetail(agr)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details & Audit
                          </DropdownMenuItem>

                          {agr.status !== "signed" && hasPermission(user, "agreements:update") && (
                            <DropdownMenuItem onClick={() => handleEdit(agr)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Draft
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem onClick={() => handleDownloadPdf(agr)}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              copyToClipboard(
                                getPublicSigningUrl(agr.publicToken),
                                "Signing URL copied to clipboard"
                              )
                            }
                          >
                            <Copy className="mr-2 h-4 w-4" /> Copy Signing URL
                          </DropdownMenuItem>

                          {agr.status === "signed" && hasPermission(user, "agreements:create") && (
                            <DropdownMenuItem onClick={() => createVersion.mutateAsync(agr._id)}>
                              <FileCheck className="mr-2 h-4 w-4" /> Create Version {agr.version + 1}
                            </DropdownMenuItem>
                          )}

                          {hasPermission(user, "agreements:delete") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeletingAgreement(agr)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {agr.status === "signed" ? "Delete Signed Agreement" : "Delete Draft"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>
            Page {meta.page} of {meta.pages} · {meta.total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals and Sheets */}
      <AgreementDetailSheet
        agreementId={selectedId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
      />

      <AgreementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        agreement={editingAgreement}
        onSuccess={(agr) => {
          setSelectedId(agr._id);
        }}
      />

      <AgreementDeleteDialog
        agreement={deletingAgreement}
        open={Boolean(deletingAgreement)}
        onOpenChange={(o) => !o && setDeletingAgreement(null)}
        onConfirm={handleDelete}
        pending={deleteAgreement.isPending}
      />
    </div>
  );
}
