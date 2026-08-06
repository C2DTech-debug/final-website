"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileUp, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface ApplyFormProps {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
}

export function ApplyForm({ jobId, jobSlug, jobTitle }: ApplyFormProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const mutation = useMutation({
    mutationFn: (values: {
      name: string;
      email: string;
      phone: string;
      coverLetter: string;
      linkedin: string;
      portfolio: string;
      expectedSalary: string;
    }) => {
      const fd = new FormData();
      fd.append("job", jobId);
      fd.append("name", values.name);
      fd.append("email", values.email);
      fd.append("phone", values.phone);
      fd.append("coverLetter", values.coverLetter);
      fd.append("linkedin", values.linkedin);
      fd.append("portfolio", values.portfolio);
      fd.append("expectedSalary", values.expectedSalary);
      fd.append("recaptchaToken", "");
      if (file) fd.append("resume", file);
      return api.upload<{ id: string; message: string }>(`/api/v1/public/careers/${jobSlug}/apply`, fd, { auth: false });
    },
    onSuccess: () => {
      toast.success("Application submitted! We'll get back to you soon.");
      setFile(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to submit application"),
  });

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    linkedin: "",
    portfolio: "",
    expectedSalary: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please provide at least your name and email.");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ja-name">Name *</Label>
          <Input id="ja-name" placeholder="Your full name" value={form.name} onChange={set("name")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ja-email">Email *</Label>
          <Input id="ja-email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ja-phone">Phone</Label>
          <Input id="ja-phone" placeholder="+91 …" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ja-salary">Expected salary</Label>
          <Input id="ja-salary" placeholder="e.g. ₹6–9 LPA" value={form.expectedSalary} onChange={set("expectedSalary")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ja-linkedin">LinkedIn</Label>
          <Input id="ja-linkedin" placeholder="https://linkedin.com/in/…" value={form.linkedin} onChange={set("linkedin")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ja-portfolio">Portfolio / GitHub</Label>
          <Input id="ja-portfolio" placeholder="https://github.com/…" value={form.portfolio} onChange={set("portfolio")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ja-cover">Cover letter</Label>
        <Textarea id="ja-cover" rows={5} placeholder="Tell us about yourself, your experience and why you'd be a great fit…" value={form.coverLetter} onChange={set("coverLetter")} />
      </div>

      <div className="space-y-2">
        <Label>Resume *</Label>
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
            file && "border-primary/50"
          )}
        >
          {file ? (
            <>
              <span className="flex items-center gap-2 font-medium text-foreground">
                <FileUp className="h-4 w-4" /> {file.name}
              </span>
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                }}
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </>
          ) : (
            <>
              <FileUp className="h-6 w-6" />
              <span>Click to upload (PDF, DOC, DOCX or image, max 8MB)</span>
            </>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending || !file}>
        {mutation.isPending ? <Spinner /> : `Apply for ${jobTitle}`}
      </Button>
    </form>
  );
}
