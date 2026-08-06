"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { EntityManager, type EntityColumn, type EntityField } from "@/components/admin/entity-manager";
import { PORTFOLIO_STATUSES } from "@/constants";

const fields: EntityField[] = [
  { name: "title", label: "Title", type: "text", required: true, placeholder: "E-commerce Platform" },
  { name: "slug", label: "Slug", type: "text", placeholder: "ecommerce-platform" },
  { name: "shortDescription", label: "Short description", type: "textarea", full: true },
  { name: "description", label: "Full description", type: "textarea", full: true },
  { name: "coverImage", label: "Cover image", type: "image", full: true },
  { name: "gallery", label: "Gallery", type: "images", full: true },
  { name: "liveUrl", label: "Live URL", type: "text" },
  { name: "githubUrl", label: "GitHub URL", type: "text" },
  { name: "technologies", label: "Technologies", type: "tags", full: true },
  { name: "tags", label: "Tags", type: "tags", full: true },
  { name: "category", label: "Category", type: "text" },
  { name: "client", label: "Client", type: "text" },
  { name: "year", label: "Year", type: "text", placeholder: "2025" },
  { name: "role", label: "Role", type: "text" },
  { name: "status", label: "Status", type: "select", options: PORTFOLIO_STATUSES.map((s) => ({ value: s.value, label: s.label })) },
  { name: "order", label: "Order", type: "number", min: 0 },
  { name: "featured", label: "Featured", type: "switch" },
];

const columns: EntityColumn[] = [
  {
    key: "title",
    label: "Project",
    render: (row) => (
      <div className="flex items-center gap-3">
        {row.coverImage ? (
          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md border">
            <Image src={String(row.coverImage)} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="h-10 w-16 shrink-0 rounded-md border bg-muted" />
        )}
        <div>
          <p className="font-medium">{String(row.title)}</p>
          <p className="text-xs text-muted-foreground">{String(row.category || "")}</p>
        </div>
      </div>
    ),
  },
  { key: "client", label: "Client", render: (row) => <span className="text-sm">{String(row.client || "—")}</span> },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <Badge variant={row.status === "published" ? "default" : "secondary"}>
        {String(row.status || "draft")}
      </Badge>
    ),
  },
  {
    key: "featured",
    label: "Featured",
    render: (row) => (Boolean(row.featured) ? <Badge variant="default">Featured</Badge> : <span className="text-xs text-muted-foreground">No</span>),
  },
];

export default function AdminPortfolioPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Portfolio" description="Projects shown on the portfolio page." />
      <EntityManager entity="portfolio" title="projects" fields={fields} columns={columns} />
    </div>
  );
}
