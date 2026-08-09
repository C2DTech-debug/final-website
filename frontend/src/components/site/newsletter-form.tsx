"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { subscribeNewsletter } from "@/hooks/useSite";
import { newsletterSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FormError } from "@/components/ui/form-error";

export function NewsletterForm({ source = "footer", compact = false }: { source?: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: () => subscribeNewsletter({ email, source }),
    onSuccess: () => {
      toast.success("Subscribed! Welcome to the C2D Tech newsletter.");
      setEmail("");
      setError(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Subscription failed"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please enter a valid email address");
      return;
    }
    setError(null);
    mutation.mutate();
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={compact ? "flex w-full max-w-md flex-col gap-2" : "flex w-full max-w-md flex-col gap-3 sm:flex-row"}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          error={Boolean(error)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "nl-email-error" : undefined}
          aria-label="Email address"
        />
        <FormError id="nl-email-error" message={error} />
      </div>
      <Button type="submit" disabled={mutation.isPending} className={compact ? "w-full sm:w-auto" : ""}>
        {mutation.isPending ? <Spinner /> : "Subscribe"}
      </Button>
    </form>
  );
}
