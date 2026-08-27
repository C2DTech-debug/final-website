"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Spinner } from "@/components/ui/spinner";
import { AGREEMENT_TEMPLATES } from "@/constants/agreementTemplates";
import { useCreateAgreement, useUpdateAgreement } from "@/hooks/useAdmin";
import type { Agreement } from "@/types";
import { toast } from "sonner";
import { formatRupees } from "@/lib/utils";
import {
  FileText,
  User,
  Building2,
  Eye,
  Sparkles,
  Calculator,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface AgreementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreement?: Agreement | null;
  onSuccess?: (agreement: Agreement) => void;
}

export function AgreementFormDialog({
  open,
  onOpenChange,
  agreement,
  onSuccess,
}: AgreementFormDialogProps) {
  const isEditing = Boolean(agreement?._id);
  const create = useCreateAgreement();
  const update = useUpdateAgreement();
  const isPending = create.isPending || update.isPending;

  const [activeTab, setActiveTab] = React.useState("client_project");

  // Client Details
  const [clientName, setClientName] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");
  const [clientAddress, setClientAddress] = React.useState("");
  const [clientCompany, setClientCompany] = React.useState("");

  // Project Details
  const [projectName, setProjectName] = React.useState("");
  const [projectDescription, setProjectDescription] = React.useState("");
  const [projectScope, setProjectScope] = React.useState("");
  const [totalAmount, setTotalAmount] = React.useState<number>(15000);
  const [currency, setCurrency] = React.useState("INR");
  const [advancePercentage, setAdvancePercentage] = React.useState<number>(40);
  const [advanceAmount, setAdvanceAmount] = React.useState<number>(6000);
  const [finalPercentage, setFinalPercentage] = React.useState<number>(60);
  const [finalAmount, setFinalAmount] = React.useState<number>(9000);

  // Agreement Details
  const [title, setTitle] = React.useState("");
  const [agreementDate, setAgreementDate] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [body, setBody] = React.useState("");
  const [termsAndConditions, setTermsAndConditions] = React.useState("");
  const [cancellationTerms, setCancellationTerms] = React.useState("");
  const [supportTerms, setSupportTerms] = React.useState("");
  const [additionalNotes, setAdditionalNotes] = React.useState("");

  // Developer Details
  const [devName, setDevName] = React.useState("Aravindar C");
  const [devPhone, setDevPhone] = React.useState("+91 7904006320");
  const [devEmail, setDevEmail] = React.useState("concept2deploytech@gmail.com");
  const [companyName, setCompanyName] = React.useState("C2D Tech (Concept to Deploy)");
  const [companyAddress, setCompanyAddress] = React.useState(
    "2/62 First Main Road, Ganesh Nagar, Kattur, Trichy-620019, Tamil Nadu, India"
  );
  const [companyWebsite, setCompanyWebsite] = React.useState("https://c2dtech.com");

  // Signing settings
  const [signingMode, setSigningMode] = React.useState<"digital_signature" | "cca_esign">(
    "digital_signature"
  );
  const [signingProvider, setSigningProvider] = React.useState<
    "dsc_pkcs7" | "emudhra" | "protean" | "cdac"
  >("dsc_pkcs7");

  // Load defaults or existing agreement
  React.useEffect(() => {
    if (agreement) {
      setClientName(agreement.client.name || "");
      setClientPhone(agreement.client.phone || "");
      setClientEmail(agreement.client.email || "");
      setClientAddress(agreement.client.address || "");
      setClientCompany(agreement.client.company || "");

      setProjectName(agreement.project.name || "");
      setProjectDescription(agreement.project.description || "");
      setProjectScope(agreement.project.scope || "");
      setTotalAmount(agreement.project.totalAmount ?? 15000);
      setCurrency(agreement.project.currency || "INR");
      setAdvancePercentage(agreement.project.advancePercentage ?? 40);
      setAdvanceAmount(agreement.project.advanceAmount ?? 6000);
      setFinalPercentage(agreement.project.finalPercentage ?? 60);
      setFinalAmount(agreement.project.finalAmount ?? 9000);

      setTitle(agreement.agreementDetails.title || "");
      setAgreementDate(
        agreement.agreementDetails.agreementDate ||
          new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
      );
      setExpiryDate(agreement.agreementDetails.expiryDate || "");
      setBody(agreement.agreementDetails.body || "");
      setTermsAndConditions(agreement.agreementDetails.termsAndConditions || "");
      setCancellationTerms(agreement.agreementDetails.cancellationTerms || "");
      setSupportTerms(agreement.agreementDetails.supportTerms || "");
      setAdditionalNotes(agreement.agreementDetails.additionalNotes || "");

      setDevName(agreement.developer.name || "Aravindar C");
      setDevPhone(agreement.developer.phone || "+91 7904006320");
      setDevEmail(agreement.developer.email || "concept2deploytech@gmail.com");
      setCompanyName(agreement.developer.companyName || "C2D Tech (Concept to Deploy)");
      setCompanyAddress(
        agreement.developer.companyAddress ||
          "2/62 First Main Road, Ganesh Nagar, Kattur, Trichy-620019, Tamil Nadu, India"
      );
      setCompanyWebsite(agreement.developer.companyWebsite || "https://c2dtech.com");

      setSigningMode((agreement.signing?.mode as "digital_signature" | "cca_esign") || "digital_signature");
      setSigningProvider(
        (agreement.signing?.provider as "dsc_pkcs7" | "emudhra" | "protean" | "cdac") || "dsc_pkcs7"
      );
    } else if (open) {
      // Default: Apply Official C2D Tech Master Service Agreement Template
      applyTemplate("c2d-master");
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setClientCompany("");
      setClientAddress("");
      setProjectName("");
      setAgreementDate(
        new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
      );
      setTotalAmount(15000);
      setAdvancePercentage(40);
      setAdvanceAmount(6000);
      setFinalPercentage(60);
      setFinalAmount(9000);
    }
  }, [agreement, open]);

  // Recalculate advance & final whenever total amount or percentage changes
  const handleTotalAmountChange = (newTotal: number) => {
    setTotalAmount(newTotal);
    const newAdvance = Math.round((newTotal * advancePercentage) / 100);
    setAdvanceAmount(newAdvance);
    setFinalAmount(newTotal - newAdvance);
  };

  const handleAdvancePercentageChange = (newAdvancePct: number) => {
    setAdvancePercentage(newAdvancePct);
    const newAdvance = Math.round((totalAmount * newAdvancePct) / 100);
    setAdvanceAmount(newAdvance);
    setFinalPercentage(100 - newAdvancePct);
    setFinalAmount(totalAmount - newAdvance);
  };

  const applyTemplate = (templateId: string) => {
    const t = AGREEMENT_TEMPLATES.find((tmpl) => tmpl.id === templateId);
    if (!t) return;
    setTitle(t.title);
    setProjectScope(t.scope);
    setBody(t.body);
    setTermsAndConditions(t.terms);
    setCancellationTerms(t.cancellation);
    setSupportTerms(t.support);
    setAdvancePercentage(t.defaultAdvancePercentage);
    const newAdvance = Math.round((totalAmount * t.defaultAdvancePercentage) / 100);
    setAdvanceAmount(newAdvance);
    setFinalPercentage(100 - t.defaultAdvancePercentage);
    setFinalAmount(totalAmount - newAdvance);
    toast.success(`Loaded template: ${t.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) {
      toast.error("Please fill in client name, phone and email");
      setActiveTab("client_project");
      return;
    }
    if (!projectName.trim() || !title.trim() || !body.trim()) {
      toast.error("Please provide project name, agreement title and agreement body");
      setActiveTab("agreement_content");
      return;
    }

    const payload: Partial<Agreement> = {
      client: {
        name: clientName.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        address: clientAddress.trim(),
        company: clientCompany.trim(),
      },
      project: {
        name: projectName.trim(),
        description: projectDescription.trim(),
        scope: projectScope.trim(),
        totalAmount,
        currency,
        advancePercentage,
        advanceAmount,
        finalPercentage,
        finalAmount,
      },
      agreementDetails: {
        title: title.trim(),
        agreementDate: agreementDate.trim() || new Date().toLocaleDateString("en-GB"),
        expiryDate: expiryDate.trim(),
        body: body.trim(),
        termsAndConditions: termsAndConditions.trim(),
        cancellationTerms: cancellationTerms.trim(),
        supportTerms: supportTerms.trim(),
        additionalNotes: additionalNotes.trim(),
      },
      developer: {
        name: devName.trim(),
        phone: devPhone.trim(),
        email: devEmail.trim(),
        companyName: companyName.trim(),
        companyAddress: companyAddress.trim(),
        companyWebsite: companyWebsite.trim(),
      },
      signing: {
        mode: signingMode,
        provider: signingProvider,
      },
    };

    try {
      if (isEditing && agreement) {
        const res = await update.mutateAsync({ id: agreement._id, body: payload });
        toast.success("Agreement updated successfully");
        if (onSuccess) onSuccess(res);
      } else {
        const res = await create.mutateAsync(payload);
        toast.success("Agreement draft created successfully");
        if (onSuccess) onSuccess(res);
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save agreement");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Header */}
          <DialogHeader className="border-b bg-muted/20 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-bold">
                  {isEditing ? `Edit Agreement (${agreement?.agreementNumber})` : "Create New Agreement"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  All details, payment milestones, rich-text terms and developer information are fully editable.
                </DialogDescription>
              </div>

              {!isEditing && (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <Select onValueChange={applyTemplate} defaultValue="rental-mgmt">
                    <SelectTrigger className="h-9 w-[260px] text-xs">
                      <SelectValue placeholder="Select Agreement Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGREEMENT_TEMPLATES.map((tmpl) => (
                        <SelectItem key={tmpl.id} value={tmpl.id} className="text-xs">
                          {tmpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b bg-muted/10 px-6">
              <TabsList className="h-11 bg-transparent p-0">
                <TabsTrigger
                  value="client_project"
                  className="gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <User className="h-4 w-4" /> Client & Project
                </TabsTrigger>
                <TabsTrigger
                  value="agreement_content"
                  className="gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <FileText className="h-4 w-4" /> Agreement Terms & Body
                </TabsTrigger>
                <TabsTrigger
                  value="developer_company"
                  className="gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Building2 className="h-4 w-4" /> Developer & eSign
                </TabsTrigger>
                <TabsTrigger
                  value="live_preview"
                  className="gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Eye className="h-4 w-4" /> Live Preview
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: CLIENT & PROJECT */}
            <TabsContent value="client_project" className="space-y-6 p-6">
              <div className="rounded-xl border p-4">
                <h3 className="mb-3 text-sm font-semibold text-primary">Client Information</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Client Name *</Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Kavita Lakshmi"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Client Phone / WhatsApp *</Label>
                    <Input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g. +91 96552 26673"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Client Email *</Label>
                    <Input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="e.g. kavita@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Client Organization / Company (Optional)</Label>
                    <Input
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="e.g. Kavita Properties"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Address (Optional)</Label>
                    <Input
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="City, State, Country"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <h3 className="mb-3 text-sm font-semibold text-primary">Project & Commercial Details</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Project Name *</Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. C2D Rental Management Website"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Total Project Value (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={totalAmount}
                      onChange={(e) => handleTotalAmountChange(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label className="text-xs">Scope of Work & Deliverables</Label>
                    <Textarea
                      rows={3}
                      value={projectScope}
                      onChange={(e) => setProjectScope(e.target.value)}
                      placeholder="Summary of deliverables, frameworks, features..."
                    />
                  </div>
                </div>

                {/* Milestone & Payment Calculator */}
                <div className="mt-4 rounded-lg bg-muted/40 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Calculator className="h-4 w-4" /> Payment Milestones Breakdown (Automatic & Overridable)
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Advance %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={advancePercentage}
                        onChange={(e) => handleAdvancePercentageChange(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Advance Amount (₹)</Label>
                      <Input
                        type="number"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Balance %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={finalPercentage}
                        onChange={(e) => setFinalPercentage(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Balance Amount (₹)</Label>
                      <Input
                        type="number"
                        value={finalAmount}
                        onChange={(e) => setFinalAmount(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: AGREEMENT CONTENT & RICH TEXT */}
            <TabsContent value="agreement_content" className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">Agreement Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master Services & Software Engineering Agreement"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Agreement Date</Label>
                  <Input
                    value={agreementDate}
                    onChange={(e) => setAgreementDate(e.target.value)}
                    placeholder="e.g. 27 August 2026"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Agreement Body (Rich-Text Editor) *</Label>
                  <span className="text-[11px] text-muted-foreground">
                    Edit headings, lists, bold text, tables & terms
                  </span>
                </div>
                <RichTextEditor
                  value={body}
                  onChange={setBody}
                  minHeight="min-h-[260px]"
                  placeholder="Draft detailed specifications, milestones, deliverables..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Intellectual Property & General Terms</Label>
                  <RichTextEditor
                    value={termsAndConditions}
                    onChange={setTermsAndConditions}
                    minHeight="min-h-[140px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Cancellation & Refund Terms</Label>
                  <RichTextEditor
                    value={cancellationTerms}
                    onChange={setCancellationTerms}
                    minHeight="min-h-[140px]"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold">Warranty, Support & Maintenance Terms</Label>
                  <RichTextEditor
                    value={supportTerms}
                    onChange={setSupportTerms}
                    minHeight="min-h-[120px]"
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: DEVELOPER & COMPANY */}
            <TabsContent value="developer_company" className="space-y-6 p-6">
              <div className="rounded-xl border p-4">
                <h3 className="mb-3 text-sm font-semibold text-primary">Service Provider Details</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Developer / Representative Name</Label>
                    <Input value={devName} onChange={(e) => setDevName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Developer Phone</Label>
                    <Input value={devPhone} onChange={(e) => setDevPhone(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Developer Email</Label>
                    <Input value={devEmail} onChange={(e) => setDevEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Company Name</Label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Company Website</Label>
                    <Input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label className="text-xs">Company Address</Label>
                    <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <h3 className="mb-3 text-sm font-semibold text-primary">Cryptographic Digital Signature Engine</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Signing Execution Mode</Label>
                    <Select
                      value={signingMode}
                      onValueChange={(v: "digital_signature" | "cca_esign") => {
                        setSigningMode(v);
                        if (v === "digital_signature") setSigningProvider("dsc_pkcs7");
                        else setSigningProvider("emudhra");
                      }}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital_signature">
                          Digital Signature Certificate (DSC / X.509 PKCS#12)
                        </SelectItem>
                        <SelectItem value="cca_esign">
                          CCA-Empanelled eSign Gateway (Regulated eSign)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Provider Adapter</Label>
                    <Select
                      value={signingProvider}
                      onValueChange={(v: "dsc_pkcs7" | "emudhra" | "protean" | "cdac") =>
                        setSigningProvider(v)
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dsc_pkcs7">
                          Digital Signature Certificate (DSC / PKCS#12 / PFX)
                        </SelectItem>
                        <SelectItem value="emudhra">eMudhra eSign 3.0 (CCA Licensed CA)</SelectItem>
                        <SelectItem value="protean">Protean eSign (formerly NSDL, CCA Licensed CA)</SelectItem>
                        <SelectItem value="cdac">C-DAC eSign Gateway (CCA Licensed CA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Cryptographic digital signatures are generated using asymmetric public-key cryptography (RSA-SHA256 / PKCS#7 detached signature) with X.509 digital certificates or CCA-authorized gateways.
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: LIVE PREVIEW */}
            <TabsContent value="live_preview" className="p-6">
              <div className="mx-auto max-w-3xl rounded-xl border bg-card p-8 shadow-sm">
                {/* Header preview */}
                <div className="flex flex-wrap items-start justify-between border-b pb-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-primary">{companyName}</h2>
                    <p className="text-xs text-muted-foreground">{companyAddress}</p>
                    <p className="text-xs text-muted-foreground">{companyWebsite} | {devPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-foreground">
                      AGREEMENT REF: {agreement?.agreementNumber || "C2D-AGR-2026-DRAFT"}
                    </p>
                    <p className="text-xs text-muted-foreground">Date: {agreementDate || "27 August 2026"}</p>
                  </div>
                </div>

                <div className="my-6 text-center">
                  <h1 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                    {title || "SERVICE AGREEMENT"}
                  </h1>
                </div>

                {/* Parties preview */}
                <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-4 text-xs">
                  <div>
                    <p className="font-bold text-primary">SERVICE PROVIDER:</p>
                    <p className="font-medium text-foreground">{devName}</p>
                    <p className="text-muted-foreground">{companyName}</p>
                    <p className="text-muted-foreground">{devEmail}</p>
                  </div>
                  <div>
                    <p className="font-bold text-primary">CLIENT:</p>
                    <p className="font-medium text-foreground">{clientName || "Client Name"}</p>
                    <p className="text-muted-foreground">{clientCompany || "Individual"}</p>
                    <p className="text-muted-foreground">{clientPhone} | {clientEmail}</p>
                  </div>
                </div>

                {/* Financials preview */}
                <div className="my-6 rounded-lg border p-4 text-xs">
                  <h4 className="font-bold text-foreground">Project & Financial Terms</h4>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-muted-foreground">Project:</span>
                      <p className="font-medium">{projectName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-bold text-primary">{formatRupees(totalAmount * 100)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Advance ({advancePercentage}%):</span>
                      <p className="font-medium">{formatRupees(advanceAmount * 100)}</p>
                    </div>
                  </div>
                </div>

                {/* Body Preview */}
                <div className="prose prose-sm dark:prose-invert max-w-none border-t pt-4">
                  <div dangerouslySetInnerHTML={{ __html: body || "<p>Agreement body content preview...</p>" }} />
                </div>

                {/* Terms Preview */}
                {termsAndConditions && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-xs font-bold text-foreground">Terms & Conditions</h4>
                    <div
                      className="prose prose-xs dark:prose-invert mt-1 text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: termsAndConditions }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : isEditing ? "Save Changes" : "Create Agreement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
