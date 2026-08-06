"use client";

import * as React from "react";
import Image from "next/image";
import { KeyRound, Save, ShieldCheck, ShieldOff } from "lucide-react";
import {
  useChangePassword,
  useDisable2FA,
  useEnable2FA,
  useMe,
  useSettings,
  useUpdateSettings,
  useSetup2FA,
} from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/authStore";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { SETTING_GROUPS } from "@/constants";
import type { SettingDoc } from "@/types";
import { toast } from "sonner";

function SettingInput({ doc, value, onChange }: { doc: SettingDoc; value: unknown; onChange: (v: unknown) => void }) {
  const type = doc.type || "text";

  if (type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
        <span className="text-sm">{doc.label}</span>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }

  if (type === "number") {
    return (
      <div className="space-y-1.5">
        <Label>{doc.label}</Label>
        <Input
          type="number"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      </div>
    );
  }

  if (type === "object" || type === "json" || type === "array") {
    const text = JSON.stringify(value ?? null, null, 2);
    return (
      <div className="space-y-1.5">
        <Label>{doc.label}</Label>
        <Textarea
          rows={6}
          className="font-mono text-xs"
          value={text}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              onChange(e.target.value);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label>{doc.label}</Label>
      <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function WebsiteSettingsTab() {
  const { data, isLoading } = useSettings();
  const save = useUpdateSettings();
  const [draft, setDraft] = React.useState<Record<string, unknown>>({});
  const [activeGroup, setActiveGroup] = React.useState<string>(SETTING_GROUPS[0].value);

  React.useEffect(() => {
    if (data) {
      const all: Record<string, unknown> = {};
      for (const group of Object.values(data)) {
        for (const doc of Object.values(group)) {
          all[`${doc.group}.${doc.key}`] = doc.value;
        }
      }
      setDraft(all);
    }
  }, [data]);

  const currentGroup = data?.[activeGroup];
  const docs = currentGroup ? Object.values(currentGroup) : [];

  const handleSave = async () => {
    const updates = Object.entries(draft).map(([path, value]) => {
      const dot = path.indexOf(".");
      const group = path.slice(0, dot);
      const key = path.slice(dot + 1);
      const doc = data?.[group]?.[key];
      return { group, key, value, type: doc?.type, label: doc?.label };
    });
    try {
      await save.mutateAsync(updates);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
        {SETTING_GROUPS.map((g) => (
          <Button
            key={g.value}
            type="button"
            variant={activeGroup === g.value ? "secondary" : "ghost"}
            size="sm"
            className="justify-start whitespace-nowrap"
            onClick={() => setActiveGroup(g.value)}
          >
            {g.label}
          </Button>
        ))}
      </div>

      <Card className="lg:col-span-3">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{SETTING_GROUPS.find((g) => g.value === activeGroup)?.label}</CardTitle>
            <CardDescription>Edit content that powers the website.</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={save.isPending}>
            {save.isPending ? <Spinner /> : <Save className="h-4 w-4" />} Save
          </Button>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No settings in this group yet.</p>
          ) : (
            <div className="space-y-4">
              {docs.map((doc) => (
                <SettingInput
                  key={doc.key}
                  doc={doc}
                  value={draft[`${doc.group}.${doc.key}`]}
                  onChange={(v) => setDraft((d) => ({ ...d, [`${doc.group}.${doc.key}`]: v }))}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountTab() {
  const { user, setUser } = useAuthStore();
  const { data: meData } = useMe();
  const changePassword = useChangePassword();
  const setup2FA = useSetup2FA();
  const enable2FA = useEnable2FA();
  const disable2FA = useDisable2FA();

  const [pw, setPw] = React.useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [setup, setSetup] = React.useState<{ secret: string; qr: string } | null>(null);
  const [code, setCode] = React.useState("");

  React.useEffect(() => {
    if (meData?.user) setUser(meData.user);
  }, [meData, setUser]);

  const twoFactorEnabled = user?.twoFactorEnabled ?? false;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) return toast.error("New password must be at least 8 characters");
    if (pw.newPassword !== pw.confirm) return toast.error("Passwords do not match");
    try {
      await changePassword.mutateAsync({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success("Password changed");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Change failed");
    }
  };

  const handleSetup = async () => {
    try {
      const data = await setup2FA.mutateAsync();
      setSetup(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Setup failed");
    }
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enable2FA.mutateAsync(code);
      toast.success("2FA enabled");
      setSetup(null);
      setCode("");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enable failed");
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Enter your current 2FA code");
    try {
      await disable2FA.mutateAsync(code);
      toast.success("2FA disabled");
      setCode("");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Disable failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Change password
          </CardTitle>
          <CardDescription>Update the password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>Current password</Label>
              <Input type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input type="password" required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Confirm new password</Label>
              <Input type="password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </div>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? <Spinner /> : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {twoFactorEnabled ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
            Two-factor authentication
          </CardTitle>
          <CardDescription>
            {twoFactorEnabled ? "2FA is currently enabled on your account." : "Add an extra layer of security to your login."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!twoFactorEnabled && !setup && (
            <Button onClick={handleSetup} disabled={setup2FA.isPending}>
              {setup2FA.isPending ? <Spinner /> : <ShieldCheck className="h-4 w-4" />} Set up 2FA
            </Button>
          )}

          {setup && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 rounded-lg border p-4">
                <Image src={setup.qr} alt="Scan with your authenticator app" width={180} height={180} unoptimized />
                <p className="text-center text-xs text-muted-foreground">
                  Scan this QR with Google Authenticator or similar, then enter the 6-digit code.
                </p>
              </div>
              <form onSubmit={handleEnable} className="flex gap-2">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
                <Button type="submit" disabled={enable2FA.isPending || code.length !== 6}>
                  {enable2FA.isPending ? <Spinner /> : "Enable"}
                </Button>
              </form>
            </div>
          )}

          {twoFactorEnabled && (
            <form onSubmit={handleDisable} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Enter a valid code from your authenticator app to disable 2FA.
              </p>
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
                <Button type="submit" variant="outline" disabled={disable2FA.isPending || code.length !== 6}>
                  {disable2FA.isPending ? <Spinner /> : "Disable"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Website content, SEO and account preferences." />

      <Tabs defaultValue="website">
        <TabsList>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="website" className="pt-4">
          <WebsiteSettingsTab />
        </TabsContent>
        <TabsContent value="account" className="pt-4">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
