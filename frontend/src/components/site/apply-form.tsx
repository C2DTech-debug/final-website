"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileUp, X } from "lucide-react";
import { api } from "@/lib/api";
import { applyFormSchema, handleNumericPaste } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";

interface ApplyFormProps {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
}

const RESUME_MAX_BYTES = 8 * 1024 * 1024;
const RESUME_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".rtf", ".jpg", ".jpeg", ".png", ".webp", ".gif"];

function resumeExtensionError(file: File | null): string | null {
  if (!file) return "Please upload your resume.";
  const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
  if (!RESUME_EXTENSIONS.includes(ext)) {
    return "Only PDF, DOC, DOCX, TXT, RTF or image files (max 8MB) are accepted.";
  }
  if (file.size > RESUME_MAX_BYTES) {
    return "Resume must be under 8MB.";
  }
  return null;
}

export function ApplyForm({ jobId, jobSlug, jobTitle }: ApplyFormProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
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
      setFileError(null);
      setErrors({});
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null;
    const err = resumeExtensionError(next);
    if (err) {
      setFile(null);
      setFileError(err);
      e.target.value = "";
      return;
    }
    setFile(next);
    setFileError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = applyFormSchema.safeParse(form);
    const nextErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      }
    }
    const resumeErr = resumeExtensionError(file);
    if (resumeErr) setFileError(resumeErr);

    if (Object.keys(nextErrors).length > 0 || resumeErr) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setFileError(null);
    mutation.mutate(form);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ja-name">Name *</Label>
          <Input
            id="ja-name"
            placeholder="Your full name"
            value={form.name}
            onChange={set("name")}
            autoComplete="name"
            error={Boolean(errors.name)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "ja-name-error" : undefined}
          />
          <FormError id="ja-name-error" message={errors.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ja-email">Email *</Label>
          <Input
            id="ja-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
            error={Boolean(errors.email)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "ja-email-error" : undefined}
          />
          <FormError id="ja-email-error" message={errors.email} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ja-phone">Phone</Label>
          <Input
            id="ja-phone"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={(e) => {
              set("phone")(e);
              if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
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
            autoComplete="tel"
            inputMode="numeric"
            maxLength={10}
            error={Boolean(errors.phone)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "ja-phone-error" : undefined}
          />
          <FormError id="ja-phone-error" message={errors.phone} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ja-salary">Expected salary</Label>
          <Input
            id="ja-salary"
            placeholder="e.g. ₹6–9 LPA"
            value={form.expectedSalary}
            onChange={set("expectedSalary")}
            error={Boolean(errors.expectedSalary)}
            aria-invalid={Boolean(errors.expectedSalary)}
            aria-describedby={errors.expectedSalary ? "ja-salary-error" : undefined}
          />
          <FormError id="ja-salary-error" message={errors.expectedSalary} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ja-linkedin">LinkedIn</Label>
          <Input
            id="ja-linkedin"
            placeholder="https://linkedin.com/in/…"
            value={form.linkedin}
            onChange={set("linkedin")}
            error={Boolean(errors.linkedin)}
            aria-invalid={Boolean(errors.linkedin)}
            aria-describedby={errors.linkedin ? "ja-linkedin-error" : undefined}
          />
          <FormError id="ja-linkedin-error" message={errors.linkedin} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ja-portfolio">Portfolio / GitHub</Label>
          <Input
            id="ja-portfolio"
            placeholder="https://github.com/…"
            value={form.portfolio}
            onChange={set("portfolio")}
            error={Boolean(errors.portfolio)}
            aria-invalid={Boolean(errors.portfolio)}
            aria-describedby={errors.portfolio ? "ja-portfolio-error" : undefined}
          />
          <FormError id="ja-portfolio-error" message={errors.portfolio} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ja-cover">Cover letter</Label>
        <Textarea
          id="ja-cover"
          rows={5}
          maxLength={5000}
          placeholder="Tell us about yourself, your experience and why you'd be a great fit…"
          value={form.coverLetter}
          onChange={set("coverLetter")}
          error={Boolean(errors.coverLetter)}
          aria-invalid={Boolean(errors.coverLetter)}
          aria-describedby={errors.coverLetter ? "ja-cover-error" : undefined}
        />
        <FormError id="ja-cover-error" message={errors.coverLetter} />
      </div>

      <div className="space-y-2">
        <Label>Resume *</Label>
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
            file && "border-primary/50",
            fileError && "border-destructive/60"
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
                  setFileError(null);
                }}
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </>
          ) : (
            <>
              <FileUp className="h-6 w-6" />
              <span>Click to upload (PDF, DOC, DOCX, TXT, RTF or image, max 8MB)</span>
            </>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.gif"
            className="hidden"
            onChange={handleFileChange}
            aria-invalid={Boolean(fileError)}
            aria-describedby={fileError ? "ja-resume-error" : undefined}
          />
        </label>
        <FormError id="ja-resume-error" message={fileError} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? <Spinner /> : `Apply for ${jobTitle}`}
      </Button>
    </form>
  );
}
