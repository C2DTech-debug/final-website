"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { ContactFormValues, contactFormSchema } from "@/lib/validations";
import { submitContact } from "@/hooks/useSite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { usePublicServices } from "@/hooks/useSite";

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
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", phone: "", service: defaultService, budget: "", timeline: "", message: "" },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values, { onSuccess: () => reset() }))}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cf-name">Name *</Label>
          <Input id="cf-name" placeholder="Your name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cf-email">Email *</Label>
          <Input id="cf-email" type="email" placeholder="you@company.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cf-phone">Phone</Label>
          <Input id="cf-phone" placeholder="+91 …" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Service</Label>
          <Select value={watch("service")} onValueChange={(v) => setValue("service", v)}>
            <SelectTrigger className="w-full">
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
          <Label>Budget</Label>
          <Select value={watch("budget")} onValueChange={(v) => setValue("budget", v)}>
            <SelectTrigger className="w-full">
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
          <Label>Timeline</Label>
          <Select value={watch("timeline")} onValueChange={(v) => setValue("timeline", v)}>
            <SelectTrigger className="w-full">
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
        <Textarea id="cf-message" rows={5} placeholder="Tell us about your project…" {...register("message")} />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? <Spinner /> : "Send Message"}
      </Button>
    </form>
  );
}
