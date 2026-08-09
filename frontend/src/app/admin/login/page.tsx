"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLogin, useVerify2FA } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { FormError } from "@/components/ui/form-error";
import { adminLoginSchema, otpSchema, handleNumericPaste } from "@/lib/validations";
import { toast } from "sonner";
import { useEffect } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { token, setAuth } = useAuthStore();
  const login = useLogin();
  const verify = useVerify2FA();

  const [step, setStep] = React.useState<"credentials" | "otp">("credentials");
  const [pendingToken, setPendingToken] = React.useState("");
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [code, setCode] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; code?: string }>({});

  useEffect(() => {
    if (token) router.replace("/admin");
  }, [token, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = adminLoginSchema.safeParse(form);
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof typeof errors;
        if (field === "email" || field === "password") if (!next[field]) next[field] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    login.mutate(
      { email: form.email, password: form.password },
      {
        onSuccess: (data) => {
          if (data.requiresTwoFactor && data.pendingToken) {
            setPendingToken(data.pendingToken);
            setStep("otp");
            toast.info("Enter your 2FA code");
            return;
          }
          if (data.accessToken && data.user) {
            setAuth(data.accessToken, data.user);
            router.replace("/admin");
          }
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Login failed"),
      }
    );
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = otpSchema.safeParse({ code });
    if (!parsed.success) {
      setErrors({ code: parsed.error.issues[0]?.message });
      return;
    }
    setErrors({});
    verify.mutate(
      { code, pendingToken },
      {
        onSuccess: (data) => {
          setAuth(data.accessToken, data.user);
          router.replace("/admin");
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Verification failed"),
      }
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute -top-32 left-1/2 -z-10 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400 shadow-lg shadow-primary/30">
            <Rocket className="h-7 w-7 text-white" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">C2D Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to the control panel</p>
        </div>

        <div className="glass-strong rounded-2xl p-6 md:p-8">
          {step === "credentials" ? (
            <form noValidate onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@c2dtech.example.com"
                  error={Boolean(errors.email)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "login-email-error" : undefined}
                />
                <FormError id="login-email-error" message={errors.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  error={Boolean(errors.password)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "login-password-error" : undefined}
                />
                <FormError id="login-password-error" message={errors.password} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
                {login.isPending ? <Spinner /> : "Sign in"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Protected area. Unauthorized access is logged and monitored.
              </p>
            </form>
          ) : (
            <form noValidate onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-code">Two-factor code</Label>
                <Input
                  id="otp-code"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ""));
                    if (errors.code) setErrors((p) => ({ ...p, code: undefined }));
                  }}
                  onPaste={(e) =>
                    handleNumericPaste(
                      e,
                      6,
                      (v) => setCode(v),
                      (m) => setErrors((p) => ({ ...p, code: m })),
                      "Enter the 6-digit verification code.",
                    )
                  }
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em]"
                  error={Boolean(errors.code)}
                  aria-invalid={Boolean(errors.code)}
                  aria-describedby={errors.code ? "otp-code-error" : undefined}
                />
                <FormError id="otp-code-error" message={errors.code} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={verify.isPending}>
                {verify.isPending ? <Spinner /> : "Verify & sign in"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep("credentials"); setCode(""); setErrors({}); }}>
                Back to sign in
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
