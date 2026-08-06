"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { subscribeNewsletter } from "@/hooks/useSite";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function NewsletterForm({ source = "footer", compact = false }: { source?: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const mutation = useMutation({
    mutationFn: () => subscribeNewsletter({ email, source }),
    onSuccess: () => {
      toast.success("Subscribed! Welcome to the C2D Tech newsletter.");
      setEmail("");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Subscription failed"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        mutation.mutate();
      }}
      className={compact ? "flex w-full max-w-md gap-2" : "flex w-full max-w-md flex-col gap-3 sm:flex-row"}
    >
      <Input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
      />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? <Spinner /> : "Subscribe"}
      </Button>
    </form>
  );
}
