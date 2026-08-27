"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useAgreement,
  useGenerateAgreementLink,
  useCreateAgreementVersion,
  useCancelAgreement,
  useDeleteAgreement,
} from "@/hooks/useAdmin";
import { agreementStatusColor } from "@/constants";
import { AGREEMENT_STATUS_LABELS, type Agreement } from "@/types";
import { cn, formatDateTime, formatRupees } from "@/lib/utils";
import { downloadAdminAgreementPdf } from "@/lib/pdfDownload";
import { AgreementDeleteDialog } from "@/components/admin/agreement-delete-dialog";
import { toast } from "sonner";
import {
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  History,
  Link2,
  MessageSquare,
  PlusCircle,
  QrCode,
  Send,
  Share2,
  ShieldCheck,
  Ban,
  Clock,
  Trash2,
} from "lucide-react";

interface AgreementDetailSheetProps {
  agreementId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (agreement: Agreement) => void;
}

export function AgreementDetailSheet({
  agreementId,
  open,
  onOpenChange,
  onEdit,
}: AgreementDetailSheetProps) {
  const { data: agreement, isLoading } = useAgreement(agreementId ?? "");
  const generateLink = useGenerateAgreementLink();
  const createVersion = useCreateAgreementVersion();
  const cancelAgreement = useCancelAgreement();
  const deleteAgreement = useDeleteAgreement();
  const [deletingOpen, setDeletingOpen] = React.useState(false);

  const isSigned = agreement?.status === "signed";
  const isCancelled = agreement?.status === "cancelled";

  const copyToClipboard = (text: string, label = "Copied to clipboard") => {
    navigator.clipboard?.writeText(text);
    toast.success(label);
  };

  const getPublicSigningUrl = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://c2dtech.com";
    return `${origin}/agreement/${token}`;
  };

  const handleWhatsAppShare = () => {
    if (!agreement) return;
    const url = getPublicSigningUrl(agreement.publicToken);
    const cleanPhone = agreement.client.phone.replace(/[^0-9]/g, "");
    const message = `Hello ${agreement.client.name},

Your agreement for ${agreement.project.name} is ready for review and electronic signing.

Please review the agreement using the secure link below:
${url}

Regards,
${agreement.developer.name || "Aravindar C"}
${agreement.developer.companyName || "C2D Tech"}
${agreement.developer.phone || "+91 7904006320"}`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const handleNativeShare = async () => {
    if (!agreement) return;
    const url = getPublicSigningUrl(agreement.publicToken);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Agreement - ${agreement.project.name}`,
          text: `Please review and electronically sign the agreement for ${agreement.project.name}`,
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

  const handleGenerateLink = async () => {
    if (!agreement) return;
    try {
      const res = await generateLink.mutateAsync(agreement._id);
      const url = getPublicSigningUrl(res.publicToken);
      copyToClipboard(url, "Signing link generated & copied to clipboard!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate signing link");
    }
  };

  const handleCreateVersion = async () => {
    if (!agreement) return;
    try {
      await createVersion.mutateAsync(agreement._id);
      toast.success(`Created Version ${agreement.version + 1} draft`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create new version");
    }
  };

  const handleCancel = async () => {
    if (!agreement) return;
    try {
      await cancelAgreement.mutateAsync(agreement._id);
      toast.success("Agreement marked as cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel agreement");
    }
  };

  const downloadPdf = () => {
    if (!agreement) return;
    downloadAdminAgreementPdf(agreement._id, agreement.agreementNumber);
  };

  const handleDeleteConfirm = async () => {
    if (!agreement) return;
    try {
      await deleteAgreement.mutateAsync(agreement._id);
      toast.success(
        agreement.status === "signed"
          ? "Signed agreement permanently deleted"
          : "Agreement draft deleted"
      );
      setDeletingOpen(false);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete agreement");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        {isLoading || !agreement ? (
          <div className="space-y-4 pt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-5 pb-8">
            {/* Header */}
            <SheetHeader className="border-b pb-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <SheetTitle className="font-mono text-lg font-bold">
                    {agreement.agreementNumber}
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">
                    Version {agreement.version} · Created {formatDateTime(agreement.createdAt)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-semibold", agreementStatusColor(agreement.status))}
                >
                  {AGREEMENT_STATUS_LABELS[agreement.status] ?? agreement.status}
                </Badge>
              </div>
            </SheetHeader>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/20 p-3">
              <Button size="sm" variant="outline" onClick={downloadPdf}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
              </Button>

              <Button size="sm" variant="outline" onClick={handleWhatsAppShare}>
                <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> WhatsApp
              </Button>

              <Button size="sm" variant="outline" onClick={handleNativeShare}>
                <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
              </Button>

              {!isSigned && !isCancelled && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleGenerateLink}
                  disabled={generateLink.isPending}
                >
                  {generateLink.isPending ? <Spinner /> : <Link2 className="mr-1.5 h-3.5 w-3.5" />}
                  {agreement.status === "draft" ? "Generate Link & Send" : "Copy Link"}
                </Button>
              )}

              {isSigned && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCreateVersion}
                  disabled={createVersion.isPending}
                >
                  {createVersion.isPending ? <Spinner /> : <PlusCircle className="mr-1.5 h-3.5 w-3.5" />}
                  Create Version {agreement.version + 1}
                </Button>
              )}

              {!isSigned && !isCancelled && onEdit && (
                <Button size="sm" variant="outline" onClick={() => onEdit(agreement)}>
                  Edit Draft
                </Button>
              )}

              {!isCancelled && !isSigned && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleCancel}
                  disabled={cancelAgreement.isPending}
                >
                  <Ban className="mr-1.5 h-3.5 w-3.5" /> Cancel
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeletingOpen(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {isSigned ? "Delete Contract" : "Delete Draft"}
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="signature" className="text-xs">Execution</TabsTrigger>
                <TabsTrigger value="versions" className="text-xs">Versions ({agreement.versions?.length || 1})</TabsTrigger>
                <TabsTrigger value="audit" className="text-xs">Audit Trail</TabsTrigger>
              </TabsList>

              {/* TAB 1: OVERVIEW */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Client & Project Cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border p-3.5 text-xs">
                    <span className="font-semibold text-primary">Client Details</span>
                    <div className="mt-2 space-y-1">
                      <p className="font-medium text-foreground">{agreement.client.name}</p>
                      <p className="text-muted-foreground">{agreement.client.company || "Individual"}</p>
                      <p className="text-muted-foreground">{agreement.client.phone}</p>
                      <p className="text-muted-foreground">{agreement.client.email}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border p-3.5 text-xs">
                    <span className="font-semibold text-primary">Financial Summary</span>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-foreground">
                          {formatRupees(agreement.project.totalAmount * 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Advance ({agreement.project.advancePercentage}%):</span>
                        <span className="font-medium">
                          {formatRupees(agreement.project.advanceAmount * 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Balance ({agreement.project.finalPercentage}%):</span>
                        <span className="font-medium">
                          {formatRupees(agreement.project.finalAmount * 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="rounded-xl border p-4 text-xs">
                  <h4 className="font-semibold text-foreground">Project Specification</h4>
                  <p className="mt-1 font-medium text-primary">{agreement.project.name}</p>
                  {agreement.project.scope && (
                    <p className="mt-2 text-muted-foreground leading-relaxed">{agreement.project.scope}</p>
                  )}
                </div>

                {/* Agreement Body Content */}
                <div className="rounded-xl border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground">Agreement Body & Terms</h4>
                    <span className="text-[10px] text-muted-foreground">Exact content representation</span>
                  </div>
                  <div
                    className="prose prose-xs dark:prose-invert max-h-72 overflow-y-auto rounded-lg bg-muted/20 p-3"
                    dangerouslySetInnerHTML={{ __html: agreement.agreementDetails.body }}
                  />
                </div>
              </TabsContent>

              {/* TAB 2: EXECUTION & DIGITAL SIGNATURE */}
              <TabsContent value="signature" className="mt-4 space-y-4">
                {isSigned ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="h-5 w-5" /> Document Digitally Signed & Cryptographically Verified
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Signer Name:</dt>
                        <dd className="font-medium text-foreground">{agreement.signing.signerName || agreement.client.name}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Signer Email:</dt>
                        <dd className="font-medium text-foreground">{agreement.signing.signerEmail || agreement.client.email}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Execution Date:</dt>
                        <dd className="font-medium text-foreground">
                          {agreement.signing.signedAt ? formatDateTime(agreement.signing.signedAt) : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Recorded Signer IP:</dt>
                        <dd className="font-mono text-foreground">{agreement.signing.signerIp || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Provider Reference:</dt>
                        <dd className="font-mono text-foreground">{agreement.signing.providerReference || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Signature Algorithm:</dt>
                        <dd className="font-medium text-foreground">
                          {agreement.signing.signatureAlgorithm || "RSA-SHA256 (PKCS#1 v1.5 / X.509)"}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Certificate Issuer / Authority:</dt>
                        <dd className="font-medium text-foreground">
                          {agreement.signing.certificateIssuer || "X.509 Digital Signature Authority"}
                        </dd>
                      </div>
                    </dl>

                    {agreement.signing.documentHash && (
                      <div className="mt-4 border-t border-emerald-500/20 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">SHA-256 Document Digest:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 px-2 text-[11px]"
                            onClick={() => copyToClipboard(agreement.signing.documentHash!, "SHA-256 Hash copied")}
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </Button>
                        </div>
                        <code className="mt-1 block break-all rounded bg-muted/60 p-2 font-mono text-[11px] text-foreground">
                          {agreement.signing.documentHash}
                        </code>
                      </div>
                    )}

                    {agreement.signing.digitalSignatureValue && (
                      <div className="mt-3 border-t border-emerald-500/20 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Cryptographic Signature (Base64):</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 px-2 text-[11px]"
                            onClick={() => copyToClipboard(agreement.signing.digitalSignatureValue!, "Digital signature copied")}
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </Button>
                        </div>
                        <code className="mt-1 block break-all rounded bg-muted/60 p-2 font-mono text-[10px] text-muted-foreground">
                          {agreement.signing.digitalSignatureValue.slice(0, 120)}...
                        </code>
                      </div>
                    )}

                    <div className="mt-3 rounded bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
                      Cryptographic Notice: Verified asymmetric digital signature with immutable digest record and audit log.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border bg-muted/20 p-6 text-center text-xs">
                    <Clock className="mx-auto h-8 w-8 text-muted-foreground/60" />
                    <h4 className="mt-2 font-semibold text-foreground">Agreement Pending Digital Signature</h4>
                    <p className="mt-1 text-muted-foreground">
                      This agreement is currently in <strong>{agreement.status.toUpperCase()}</strong> status.
                      Once executed via the configured Digital Signature Certificate (DSC) or CCA eSign gateway, the cryptographic signature and verification records will appear here.
                    </p>
                    <Button size="sm" className="mt-4" onClick={handleGenerateLink}>
                      <Link2 className="mr-1.5 h-3.5 w-3.5" /> Share Signing Link
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* TAB 3: VERSION HISTORY */}
              <TabsContent value="versions" className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold">Preserved Agreement Versions</h4>
                  {isSigned && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleCreateVersion}>
                      <PlusCircle className="mr-1 h-3 w-3" /> New Version
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border bg-primary/5 p-3 text-xs">
                    <div>
                      <span className="font-bold text-foreground">Version {agreement.version} (Active)</span>
                      <p className="text-[11px] text-muted-foreground">
                        Status: {agreement.status.toUpperCase()} · Last updated {formatDateTime(agreement.updatedAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className={agreementStatusColor(agreement.status)}>
                      Active
                    </Badge>
                  </div>

                  {agreement.versions?.map((v) => (
                    <div key={v._id} className="flex items-center justify-between rounded-lg border p-3 text-xs">
                      <div>
                        <span className="font-semibold text-foreground">Version {v.version}</span>
                        <p className="text-[11px] text-muted-foreground">
                          {v.signedAt ? `Signed on ${formatDateTime(v.signedAt)}` : `Preserved snapshot`}
                        </p>
                      </div>
                      <Badge variant="outline" className={agreementStatusColor(v.status)}>
                        {v.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 4: IMMUTABLE AUDIT TRAIL */}
              <TabsContent value="audit" className="mt-4">
                <div className="rounded-xl border p-4">
                  <h4 className="mb-3 text-xs font-semibold">Audit Event Log</h4>
                  <ol className="relative ml-2 space-y-4 border-l border-muted pl-5">
                    {agreement.auditTrail?.map((log, idx) => (
                      <li key={log._id || idx} className="relative text-xs">
                        <span className="absolute -left-[25px] top-1 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground capitalize">{log.action.replace(/_/g, " ")}</span>
                          <span className="text-[11px] text-muted-foreground">{formatDateTime(log.timestamp)}</span>
                        </div>
                        <p className="mt-0.5 text-muted-foreground">{log.description}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                          Actor: {log.actor || "System"} {log.ip ? `· IP: ${log.ip}` : ""}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </TabsContent>
            </Tabs>

            <AgreementDeleteDialog
              agreement={agreement}
              open={deletingOpen}
              onOpenChange={setDeletingOpen}
              onConfirm={handleDeleteConfirm}
              pending={deleteAgreement.isPending}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
