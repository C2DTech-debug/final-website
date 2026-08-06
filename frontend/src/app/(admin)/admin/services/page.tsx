"use client";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { EntityManager, type EntityColumn, type EntityField } from "@/components/admin/entity-manager";
import { SERVICE_ICON_OPTIONS } from "@/constants";
import { formatINR } from "@/lib/utils";

const fields: EntityField[] = [
  { name: "name", label: "Service name", type: "text", required: true, placeholder: "Web Development" },
  { name: "slug", label: "Slug", type: "text", placeholder: "web-development" },
  { name: "tagline", label: "Tagline", type: "text", full: true },
  {
    name: "icon",
    label: "Icon",
    type: "select",
    options: SERVICE_ICON_OPTIONS.map((i) => ({ value: i, label: i })),
  },
  { name: "category", label: "Category", type: "text", placeholder: "Development" },
  { name: "image", label: "Image", type: "image", full: true },
  { name: "shortDescription", label: "Short description", type: "textarea", full: true },
  { name: "description", label: "Full description", type: "textarea", full: true },
  { name: "features", label: "Features", type: "tags", full: true },
  { name: "deliverables", label: "Deliverables", type: "tags", full: true },
  { name: "pricing.startingAt", label: "Starting price (INR)", type: "number", min: 0 },
  { name: "pricing.deliveryDays", label: "Delivery days", type: "number", min: 0 },
  { name: "pricing.priceLabel", label: "Price label", type: "text", placeholder: "From ₹10,000" },
  { name: "order", label: "Order", type: "number", min: 0 },
  { name: "published", label: "Published", type: "switch" },
];

const columns: EntityColumn[] = [
  {
    key: "name",
    label: "Service",
    render: (row) => (
      <div>
        <p className="font-medium">{String(row.name)}</p>
        <p className="max-w-xs truncate text-xs text-muted-foreground">{String(row.tagline || "")}</p>
      </div>
    ),
  },
  { key: "category", label: "Category", render: (row) => <Badge variant="secondary">{String(row.category || "—")}</Badge> },
  {
    key: "pricing.startingAt",
    label: "Starting at",
    render: (row) => {
      const val = (row as { pricing?: { startingAt?: number } }).pricing?.startingAt;
      return <span className="text-sm">{val ? formatINR(val) : "—"}</span>;
    },
  },
  { key: "published", label: "Status", render: (row) => <Badge variant={Boolean(row.published) ? "default" : "secondary"}>{Boolean(row.published) ? "Published" : "Draft"}</Badge> },
];

export default function AdminServicesPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Services" description="Manage the services displayed on the website." />
      <EntityManager entity="service" title="services" fields={fields} columns={columns} />
    </div>
  );
}
