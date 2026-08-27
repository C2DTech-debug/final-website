"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { ContactFormValues, contactFormSchema, handleNumericPaste } from "@/lib/validations";
import { submitContact, usePublicServices } from "@/hooks/useSite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import { Spinner } from "@/components/ui/spinner";

const BUDGETS = ["Under ₹50k", "₹50k – ₹2L", "₹2L – ₹5L", "₹5L – ₹10L", "₹10L+"];
const TIMELINES = ["ASAP", "1 month", "1–3 months", "3–6 months", "Flexible"];

export function ContactForm({ defaultService = "" }: { defaultService?: string }) {
  const { data: services } = usePublicServices();
  const mutation = useMutation({
    mutationFn: (values: ContactFormValues) => submitContact({ ...values, phone: values.phone || "", recaptchaToken: "" }),
    onSuccess: () => toast.success("Message sent! We'll get back to you within 24 hours."),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to send message"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", phone: "", service: defaultService, budget: "", timeline: "", message: "" },
  });

  const phoneRegister = register("phone");

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => mutation.mutate(values, { onSuccess: () => reset() }))}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cf-name">Name *</Label>
          <Input
            id="cf-name"
            placeholder="Your name"
            autoComplete="name"
            error={Boolean(errors.name)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "cf-name-error" : undefined}
            {...register("name")}
          />
          <FormError id="cf-name-error" message={errors.name?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cf-email">Email *</Label>
          <Input
            id="cf-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={Boolean(errors.email)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "cf-email-error" : undefined}
            {...register("email")}
          />
          <FormError id="cf-email-error" message={errors.email?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cf-phone">Phone</Label>
          <Input
            id="cf-phone"
            placeholder="10-digit mobile number"
            autoComplete="tel"
            inputMode="numeric"
            maxLength={10}
            error={Boolean(errors.phone)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "cf-phone-error" : undefined}
            {...phoneRegister}
            onPaste={(e) =>
              handleNumericPaste(
                e,
                10,
                (v) => setValue("phone", v),
                (m) => setError("phone", { type: "manual", message: m }),
                "Enter a valid 10-digit mobile number.",
              )
            }
            onChange={(e) => {
              phoneRegister.onChange(e);
              if (errors.phone) clearErrors("phone");
            }}
          />
          <FormError id="cf-phone-error" message={errors.phone?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cf-service">Service</Label>
          <Select value={watch("service")} onValueChange={(v) => setValue("service", v)}>
            <SelectTrigger id="cf-service" aria-label="Select a service" className="w-full">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services?.map((s) => (
                <SelectItem key={s._id} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
              <SelectItem value="General">General Enquiry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cf-budget">Budget</Label>
          <Select value={watch("budget")} onValueChange={(v) => setValue("budget", v)}>
            <SelectTrigger id="cf-budget" aria-label="Select budget range" className="w-full">
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              {BUDGETS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cf-timeline">Timeline</Label>
          <Select value={watch("timeline")} onValueChange={(v) => setValue("timeline", v)}>
            <SelectTrigger id="cf-timeline" aria-label="Select timeline" className="w-full">
              <SelectValue placeholder="When do you need it?" />
            </SelectTrigger>
            <SelectContent>
              {TIMELINES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cf-message">Project Details *</Label>
        <Textarea
          id="cf-message"
          rows={5}
          placeholder="Tell us about your project…"
          error={Boolean(errors.message)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "cf-message-error" : undefined}
          {...register("message")}
        />
        <FormError id="cf-message-error" message={errors.message?.message} />
      </div>

      <Button type="submit" size="lg" variant="default" className="w-full h-12 text-base font-bold rounded-lg" disabled={mutation.isPending}>
        {mutation.isPending ? <Spinner /> : "Send Message"}
      </Button>
    </form>
  );
}
