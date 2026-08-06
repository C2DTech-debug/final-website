"use client";

import * as React from "react";
import { Plus, Save } from "lucide-react";
import { useSeoSettings, useUpsertSeo } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { SeoSetting } from "@/types";
import { toast } from "sonner";

const DEFAULT_SEO: SeoSetting = {
  _id: "",
  page: "",
  title: "",
  description: "",
  keywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogType: "website",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  twitterCard: "summary_large_image",
  canonical: "",
  noindex: false,
};

const KNOWN_PAGES = ["home", "about", "services", "portfolio", "team", "contact", "privacy", "terms", "cookies"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default function AdminSeoPage() {
  const { data, isLoading } = useSeoSettings();
  const save = useUpsertSeo();

  const [selectedId, setSelectedId] = React.useState<string>("");
  const [form, setForm] = React.useState<SeoSetting>(DEFAULT_SEO);

  const entries = data ?? [];

  React.useEffect(() => {
    if (entries.length > 0 && !selectedId) setSelectedId(entries[0]._id);
  }, [entries, selectedId]);

  const selected = entries.find((e) => e._id === selectedId);

  React.useEffect(() => {
    if (selected) {
      setForm({ ...DEFAULT_SEO, ...selected });
    }
  }, [selectedId, selected]);

  const startNew = () => {
    setSelectedId("");
    setForm(DEFAULT_SEO);
  };

  const handleSave = async () => {
    if (!form.page.trim()) return toast.error("Enter a page slug first");
    try {
      await save.mutateAsync(form);
      toast.success("SEO saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="SEO Manager"
        description="Meta titles, descriptions and Open Graph settings per page."
        actions={
          <Button size="sm" onClick={startNew}>
            <Plus className="h-4 w-4" /> New page
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 rounded-lg" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <EmptyState title="No SEO pages" description="Create one to get started." />
            ) : (
              <div className="space-y-1">
                {entries.map((entry) => (
                  <Button
                    key={entry._id}
                    variant={selectedId === entry._id ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start font-mono"
                    onClick={() => setSelectedId(entry._id)}
                  >
                    {entry.page}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{selectedId ? `Editing: ${selected?.page}` : "New SEO entry"}</CardTitle>
            <Button onClick={handleSave} disabled={save.isPending}>
              {save.isPending ? <Spinner /> : <Save className="h-4 w-4" />} Save
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Page slug">
                <Input
                  list="known-pages"
                  className="font-mono"
                  value={form.page}
                  placeholder="home, about, services…"
                  onChange={(e) => setForm({ ...form, page: e.target.value.trim() })}
                />
                <datalist id="known-pages">
                  {KNOWN_PAGES.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </Field>
              <Field label="Canonical URL">
                <Input value={form.canonical} placeholder="https://c2dtech.example.com/" onChange={(e) => setForm({ ...form, canonical: e.target.value })} />
              </Field>
              <Field label="Meta title">
                <Input value={form.title} placeholder="Page title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <Field label="Meta keywords">
                <Input value={form.keywords} placeholder="comma, separated, keywords" onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Meta description">
                  <Input value={form.description} placeholder="Page description" onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </Field>
              </div>

              <Field label="OG title">
                <Input value={form.ogTitle} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })} />
              </Field>
              <Field label="OG type">
                <Input value={form.ogType} onChange={(e) => setForm({ ...form, ogType: e.target.value })} />
              </Field>
              <Field label="OG description">
                <Input value={form.ogDescription} onChange={(e) => setForm({ ...form, ogDescription: e.target.value })} />
              </Field>
              <Field label="OG image URL">
                <Input value={form.ogImage} placeholder="https://…" onChange={(e) => setForm({ ...form, ogImage: e.target.value })} />
              </Field>
              <Field label="Twitter title">
                <Input value={form.twitterTitle} onChange={(e) => setForm({ ...form, twitterTitle: e.target.value })} />
              </Field>
              <Field label="Twitter card">
                <Input value={form.twitterCard} onChange={(e) => setForm({ ...form, twitterCard: e.target.value })} />
              </Field>
              <Field label="Twitter description">
                <Input value={form.twitterDescription} onChange={(e) => setForm({ ...form, twitterDescription: e.target.value })} />
              </Field>
              <Field label="Twitter image URL">
                <Input value={form.twitterImage} onChange={(e) => setForm({ ...form, twitterImage: e.target.value })} />
              </Field>
              <div className={cn("flex items-center justify-between rounded-lg border px-3 py-2.5")}>
                <span className="text-sm">Noindex (hide from search engines)</span>
                <Switch checked={form.noindex} onCheckedChange={(v) => setForm({ ...form, noindex: v })} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
