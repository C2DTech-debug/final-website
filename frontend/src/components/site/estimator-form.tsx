"use client";

import * as React from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Calculator, Clock, IndianRupee, Sparkles } from "lucide-react";
import { useEstimatorConfig, fetchQuote, submitEstimate } from "@/hooks/useSite";
import { estimateFormSchema, handleNumericPaste } from "@/lib/validations";
import { formatINR } from "@/lib/utils";
import { ServiceIcon } from "@/components/site/service-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { FormError } from "@/components/ui/form-error";
import type { QuoteResult } from "@/types";

interface DetailErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export function EstimatorForm() {
  const { data: config, isLoading } = useEstimatorConfig();
  const services = config?.services ?? [];
  const addons = config?.settings?.addons ?? [];

  const [selected, setSelected] = React.useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = React.useState<string[]>([]);
  const [quote, setQuote] = React.useState<QuoteResult | null>(null);
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = React.useState<DetailErrors>({});

  const quoteMutation = useMutation({
    mutationFn: () => fetchQuote(selected, selectedAddons),
    onSuccess: (data) => setQuote(data),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not compute quote"),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitEstimate({ ...form, services: selected, addons: selectedAddons, notes: form.notes, recaptchaToken: "" }),
    onSuccess: (data) => {
      toast.success("Estimate submitted! We'll contact you shortly.");
      setQuote((prev) => (prev ? { ...prev, totalCost: data.totalCost, timelineLabel: data.timeline } : prev));
      setSelected([]);
      setSelectedAddons([]);
      setForm({ name: "", email: "", phone: "", notes: "" });
      setErrors({});
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Submission failed"),
  });

  React.useEffect(() => {
    if (selected.length > 0) quoteMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, selectedAddons]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = estimateFormSchema.safeParse({
      name: form.name,
      email: form.email,
      phone: form.phone,
      services: selected,
      addons: selectedAddons,
      notes: form.notes,
    });
    if (!parsed.success) {
      const next: DetailErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof DetailErrors;
        if (field === "name" || field === "email" || field === "phone") {
          if (!next[field]) next[field] = issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <div className="rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Sparkles className="h-5 w-5 text-primary" /> Choose your services
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Select everything your project needs — we'll compute an instant estimate.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {services.map((service) => {
              const active = selected.includes(service.slug);
              return (
                <button
                  key={service._id}
                  type="button"
                  onClick={() => toggle(selected, setSelected, service.slug)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    active ? "border-primary bg-primary/10" : "hover:border-primary/40"
                  }`}
                  aria-pressed={active}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    <ServiceIcon icon={service.icon} className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{service.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {service.pricing?.enabled && (service.pricing.startingAt ?? 0) > 0
                        ? `From ${formatINR(service.pricing.startingAt ?? 0)}`
                        : "Custom quote"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {addons.length > 0 && (
          <div className="rounded-2xl border bg-card p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold">Add-ons</h2>
            <p className="mt-1 text-sm text-muted-foreground">Optional extras to boost your project.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {addons.map((addon) => {
                const active = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggle(selectedAddons, setSelectedAddons, addon.id)}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all ${
                      active ? "border-primary bg-primary/10" : "hover:border-primary/40"
                    }`}
                    aria-pressed={active}
                  >
                    <span className="text-sm font-medium">{addon.label}</span>
                    <span className="text-sm font-semibold text-primary">+{formatINR(addon.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form noValidate onSubmit={handleDetailsSubmit} className="rounded-2xl border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold">Your details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="est-name">Name *</Label>
              <Input
                id="est-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                autoComplete="name"
                error={Boolean(errors.name)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "est-name-error" : undefined}
              />
              <FormError id="est-name-error" message={errors.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="est-email">Email *</Label>
              <Input
                id="est-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                autoComplete="email"
                error={Boolean(errors.email)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "est-email-error" : undefined}
              />
              <FormError id="est-email-error" message={errors.email} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="est-phone">Phone</Label>
            <Input
              id="est-phone"
              value={form.phone}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value });
                if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
              }}
              onPaste={(e) =>
                handleNumericPaste(
                  e,
                  10,
                  (v) => setForm((f) => ({ ...f, phone: v })),
                  (m) => setErrors((p) => ({ ...p, phone: m })),
                  "Enter a valid 10-digit mobile number.",
                )
              }
              placeholder="10-digit mobile number"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={10}
              error={Boolean(errors.phone)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "est-phone-error" : undefined}
            />
            <FormError id="est-phone-error" message={errors.phone} />
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="est-notes">Project notes</Label>
            <Textarea
              id="est-notes"
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anything we should know?"
            />
          </div>
          <Button
            type="submit"
            variant="default"
            className="mt-6 w-full h-12 text-base font-bold rounded-lg"
            size="lg"
            disabled={selected.length === 0 || submitMutation.isPending}
          >
            {submitMutation.isPending ? <Spinner /> : "Submit for a detailed quote"}
          </Button>
        </form>
      </div>

      <div>
        <div className="sticky top-24 rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900 dark:text-white">
            <Calculator className="h-5 w-5 text-[#4274D9]" /> Your estimate
          </h2>
          {quote ? (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Estimated cost</p>
              <p className="mt-1 flex items-center gap-1 font-display text-4xl font-extrabold text-[#293681] dark:text-[#95CCDD]">
                <IndianRupee className="h-7 w-7" />
                {quote.totalCost.toLocaleString("en-IN")}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {quote.timelineLabel}
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected services</p>
                <ul className="space-y-1.5 text-sm">
                  {quote.services.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                This is an indicative estimate. Your final quote will be refined after a discovery call.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Select at least one service to see an instant estimate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
