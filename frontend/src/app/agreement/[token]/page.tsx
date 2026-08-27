"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Download,
  Building2,
  User,
  CreditCard,
  AlertCircle,
  Copy,
  PenTool,
  Type,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatRupees } from "@/lib/utils";
import { downloadPublicAgreementPdf } from "@/lib/pdfDownload";
import { toast } from "sonner";

interface PublicAgreementData {
  agreementNumber: string;
  version: number;
  status: "draft" | "sent" | "viewed" | "signed" | "expired" | "cancelled";
  client: {
    name: string;
    phone: string;
    email: string;
    company?: string;
    address?: string;
  };
  project: {
    name: string;
    description: string;
    scope: string;
    totalAmount: number;
    currency: string;
    advancePercentage: number;
    advanceAmount: number;
    finalPercentage: number;
    finalAmount: number;
  };
  agreementDetails: {
    agreementDate: string;
    expiryDate?: string;
    title: string;
    body: string;
    termsAndConditions?: string;
    cancellationTerms?: string;
    supportTerms?: string;
    additionalNotes?: string;
  };
  developer: {
    name: string;
    phone: string;
    email: string;
    companyName: string;
    companyAddress: string;
    companyWebsite: string;
    logoUrl?: string;
  };
  signing: {
    mode?: string;
    provider?: string;
    signedAt?: string | null;
    signerName?: string;
    documentHash?: string;
    signatureAlgorithm?: string;
    signatureImage?: string;
    signatureType?: "drawn" | "typed";
    certificateIssuer?: string;
    certificateInfo?: string;
    providerReference?: string;
  };
}

export default function PublicAgreementSigningPage() {
  const params = useParams();
  const token = params?.token as string;

  const [data, setData] = React.useState<PublicAgreementData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [signing, setSigning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Digital Signature State
  const [signatureMode, setSignatureMode] = React.useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = React.useState("");
  const [signerName, setSignerName] = React.useState("");
  const [signerPhone, setSignerPhone] = React.useState("");
  const [signerEmail, setSignerEmail] = React.useState("");
  const [confirmed, setConfirmed] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);

  // Canvas Ref
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = React.useRef(false);

  // Fetch agreement data
  React.useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/v1/public/agreements/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Invalid or expired agreement link");
        return res.json();
      })
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
          const name = json.data.client.name || "Client";
          setSignerName(name);
          setTypedSignature(name);
          setSignerEmail(json.data.client.email || "");
          setSignerPhone(json.data.client.phone || "");
        } else {
          throw new Error(json.error || "Failed to load agreement");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load agreement");
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Setup Canvas
  const setupCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 180 * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  React.useEffect(() => {
    if (!data || data.status === "signed") return;
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [data, setupCanvas]);

  // Canvas drawing handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ("touches" in e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;
    setHasDrawn(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if ("touches" in e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Generate data URL for signature
  const getSignatureDataUrl = (): string => {
    if (signatureMode === "draw") {
      const canvas = canvasRef.current;
      return canvas ? canvas.toDataURL("image/png") : "";
    } else {
      // Create a small offscreen canvas to render the typed text into PNG
      const offscreen = document.createElement("canvas");
      offscreen.width = 400;
      offscreen.height = 120;
      const ctx = offscreen.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0f172a";
        ctx.font = "italic bold 36px 'Georgia', serif";
        ctx.textBaseline = "middle";
        ctx.fillText(typedSignature || signerName, 20, 60);
      }
      return offscreen.toDataURL("image/png");
    }
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      toast.error("Please check the confirmation box to proceed.");
      return;
    }
    if (signatureMode === "draw" && !hasDrawn) {
      toast.error("Please draw your signature inside the box.");
      return;
    }
    if (signatureMode === "type" && !typedSignature.trim()) {
      toast.error("Please enter your name for the signature.");
      return;
    }

    setSigning(true);
    try {
      const sigDataUrl = getSignatureDataUrl();
      const res = await fetch(`/api/v1/public/agreements/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim() || data?.client.name,
          signerEmail: signerEmail.trim() || data?.client.email,
          signerPhone: signerPhone.trim() || data?.client.phone,
          signatureImage: sigDataUrl,
          signatureType: signatureMode === "draw" ? "drawn" : "typed",
          confirmRead: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error?.message || json.error || "Signing execution failed");
      }

      toast.success("Agreement successfully signed!");
      setData((prev) =>
        prev
          ? {
              ...prev,
              status: "signed",
              signing: {
                ...prev.signing,
                signedAt: json.data?.signedAt || new Date().toISOString(),
                signerName: signerName || prev.client.name,
                documentHash: json.data?.documentHash,
                signatureImage: sigDataUrl,
                signatureType: signatureMode === "draw" ? "drawn" : "typed",
                providerReference: json.data?.providerReference,
              },
            }
          : null
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signing failed");
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!token || !data) return;
    downloadPublicAgreementPdf(token, data.agreementNumber);
  };

  const copyChecksum = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success("SHA-256 Checksum copied");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading agreement document…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md rounded-xl border bg-card p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-xl font-bold">Agreement Not Available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "This agreement link is invalid, expired, or has been cancelled."}
          </p>
        </div>
      </div>
    );
  }

  const isSigned = data.status === "signed";
  const currentDateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Agreement Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-6 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              C2D Tech · Project Agreement
            </span>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
              {data.project.name}
            </h1>
            <p className="text-xs text-slate-500">
              Ref: <span className="font-mono font-semibold">{data.agreementNumber}</span> · Issued on {data.agreementDetails.agreementDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={
                isSigned
                  ? "border-emerald-500/40 bg-emerald-50 text-emerald-700 font-semibold text-xs py-1"
                  : "border-blue-500/40 bg-blue-50 text-blue-700 font-semibold text-xs py-1"
              }
            >
              {isSigned ? "✓ Signed & Executed" : "Pending Signature"}
            </Badge>

            <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Signed Success Banner */}
        {isSigned && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-emerald-950">
                    Agreement Successfully Signed
                  </h3>
                  <span className="font-mono text-emerald-800">
                    Ref: {data.signing.providerReference || "DSC-SIGNED"}
                  </span>
                </div>

                <p className="text-emerald-900 leading-relaxed">
                  This document has been digitally signed and permanently archived with cryptographic SHA-256 verification.
                </p>

                <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-emerald-200">
                  <div>
                    <span className="text-emerald-800 font-medium">Signed By:</span>{" "}
                    <span className="font-semibold text-emerald-950">{data.signing.signerName || data.client.name}</span>
                  </div>
                  <div>
                    <span className="text-emerald-800 font-medium">Date & Time:</span>{" "}
                    <span className="font-semibold text-emerald-950">
                      {data.signing.signedAt ? new Date(data.signing.signedAt).toLocaleString("en-IN") + " IST" : "—"}
                    </span>
                  </div>
                </div>

                {data.signing.signatureImage && (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3 inline-block">
                    <p className="text-[10px] font-medium text-slate-500 mb-1">Attached Digital Signature:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.signing.signatureImage}
                      alt="Digital Signature"
                      className="h-12 object-contain"
                    />
                  </div>
                )}

                {data.signing.documentHash && (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-900/5 p-2.5 font-mono text-[11px]">
                    <span className="truncate text-emerald-900">
                      SHA-256 Checksum: {data.signing.documentHash}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 px-2 text-[11px]"
                      onClick={() => copyChecksum(data.signing.documentHash!)}
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                  </div>
                )}

                <div className="pt-2">
                  <Button size="sm" onClick={handleDownloadPdf} className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700">
                    <Download className="h-4 w-4" /> Download Signed PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contract Parties & Commercial Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-4 text-xs shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-blue-600">
              <Building2 className="h-4 w-4" /> Service Provider
            </div>
            <div className="mt-2 space-y-1">
              <p className="font-bold text-slate-900">{data.developer.name}</p>
              <p className="text-slate-500">{data.developer.companyName}</p>
              <p className="text-slate-500">{data.developer.phone}</p>
              <p className="text-slate-500">{data.developer.email}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 text-xs shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-blue-600">
              <User className="h-4 w-4" /> Client
            </div>
            <div className="mt-2 space-y-1">
              <p className="font-bold text-slate-900">{data.client.name}</p>
              <p className="text-slate-500">{data.client.company || "Individual"}</p>
              <p className="text-slate-500">{data.client.phone}</p>
              <p className="text-slate-500">{data.client.email}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 text-xs shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-blue-600">
              <CreditCard className="h-4 w-4" /> Commercial Terms
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Total:</span>
                <span className="font-bold text-slate-900">{formatRupees(data.project.totalAmount * 100)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Advance ({data.project.advancePercentage}%):</span>
                <span className="font-medium text-slate-800">{formatRupees(data.project.advanceAmount * 100)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Balance ({data.project.finalPercentage}%):</span>
                <span className="font-medium text-slate-800">{formatRupees(data.project.finalAmount * 100)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Document Container */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="border-b pb-4 text-center">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-slate-900">
              {data.agreementDetails.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Please review all deliverables, milestones, and terms below before signing.
            </p>
          </div>

          {/* Scope of Work */}
          {data.project.scope && (
            <div className="my-6 rounded-xl border bg-slate-50 p-4 text-xs leading-relaxed">
              <h4 className="font-bold text-blue-600">SCOPE OF WORK & DELIVERABLES</h4>
              <p className="mt-1 text-slate-800">{data.project.scope}</p>
            </div>
          )}

          {/* Formatted Agreement Body */}
          <div className="prose prose-sm max-w-none py-4 leading-relaxed text-slate-800">
            <div dangerouslySetInnerHTML={{ __html: data.agreementDetails.body }} />
          </div>

          {/* Terms & Conditions */}
          {data.agreementDetails.termsAndConditions && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-display text-sm font-bold text-slate-900">General Terms & Conditions</h3>
              <div
                className="prose prose-xs mt-2 text-slate-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.agreementDetails.termsAndConditions }}
              />
            </div>
          )}

          {/* Cancellation Policy */}
          {data.agreementDetails.cancellationTerms && (
            <div className="mt-6 border-t pt-6">
              <h3 className="font-display text-sm font-bold text-slate-900">Cancellation & Refund Policy</h3>
              <div
                className="prose prose-xs mt-2 text-slate-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.agreementDetails.cancellationTerms }}
              />
            </div>
          )}

          {/* Support Terms */}
          {data.agreementDetails.supportTerms && (
            <div className="mt-6 border-t pt-6">
              <h3 className="font-display text-sm font-bold text-slate-900">Warranty & Support SLA</h3>
              <div
                className="prose prose-xs mt-2 text-slate-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.agreementDetails.supportTerms }}
              />
            </div>
          )}
        </div>

        {/* ---------- EXACT DIGITAL SIGNING COMPONENT ---------- */}
        {!isSigned && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            {/* Top Dark Header Bar */}
            <div className="bg-[#0f172a] px-6 py-3.5 flex items-center gap-2.5">
              <PenTool className="h-5 w-5 text-white" />
              <span className="text-xs font-semibold text-white tracking-wide uppercase">
                Digital Agreement Signature
              </span>
            </div>

            <form onSubmit={handleSign} className="p-6 sm:p-8 space-y-6">
              {/* Light Blue Confirmation Callout */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-5 text-xs text-blue-950 space-y-2">
                <p className="font-bold text-blue-900 text-sm">By signing below, I confirm that:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-blue-900/90 leading-relaxed">
                  <li>I have reviewed the agreement terms and financial details.</li>
                  <li>The information provided is accurate and true.</li>
                  <li>I agree to the terms and conditions of this agreement.</li>
                  <li>I understand that my electronic signature represents my acceptance of this agreement.</li>
                </ul>
              </div>

              {/* Tabs: Draw Signature vs Type Signature */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setSignatureMode("draw")}
                  className={`flex items-center gap-2 pb-3 px-6 text-sm font-semibold transition-all ${
                    signatureMode === "draw"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <PenTool className="h-4 w-4" /> Draw Signature
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureMode("type")}
                  className={`flex items-center gap-2 pb-3 px-6 text-sm font-semibold transition-all ${
                    signatureMode === "type"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Type className="h-4 w-4" /> Type Signature
                </button>
              </div>

              {/* Tab 1: Draw Signature */}
              {signatureMode === "draw" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800">
                      Draw your signature inside the box below
                    </p>
                    {hasDrawn && (
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Clear
                      </button>
                    )}
                  </div>

                  <div className="relative rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-slate-400 transition-colors">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="h-[180px] w-full cursor-crosshair touch-none"
                    />
                    {!hasDrawn && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                        Sign inside this box (touch or mouse)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Type Signature */}
              {signatureMode === "type" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800">
                      Type your name to generate your signature
                    </label>
                    <Input
                      value={typedSignature}
                      onChange={(e) => {
                        setTypedSignature(e.target.value);
                        setSignerName(e.target.value);
                      }}
                      placeholder="Type your full legal name"
                      className="text-sm"
                    />
                  </div>

                  <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
                    <p className="text-xs text-slate-400 mb-2">Signature Preview</p>
                    <p className="font-serif italic text-3xl font-bold text-blue-900 tracking-wide">
                      {typedSignature || signerName || "Your Signature"}
                    </p>
                  </div>
                </div>
              )}

              {/* Signer Metadata Bar */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
                      SIGNER NAME
                    </span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {signerName || data.client.name || "Resident"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
                      MOBILE NUMBER
                    </span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {signerPhone || data.client.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
                      DATE
                    </span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {currentDateStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkbox Confirmation */}
              <div className="space-y-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      I confirm that I have read and understood this agreement and agree to sign it electronically.
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      By selecting Submit & Sign, you agree that your electronic signature will be associated with this agreement.
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit & Sign Agreement Button */}
              <div>
                <button
                  type="submit"
                  disabled={signing}
                  className="w-full rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white py-3.5 px-6 font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {signing ? (
                    <>
                      <Spinner className="h-4 w-4 text-white" /> Signing Agreement...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> Submit & Sign Agreement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
