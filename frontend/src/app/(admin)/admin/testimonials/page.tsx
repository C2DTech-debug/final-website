"use client";

import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { EntityManager, type EntityColumn, type EntityField } from "@/components/admin/entity-manager";

const fields: EntityField[] = [
  { name: "name", label: "Name", type: "text", required: true, placeholder: "Rahul Sharma" },
  { name: "role", label: "Role", type: "text", placeholder: "Founder" },
  { name: "company", label: "Company", type: "text" },
  { name: "content", label: "Testimonial", type: "textarea", required: true, full: true },
  { name: "rating", label: "Rating", type: "number", min: 1, max: 5 },
  { name: "avatar", label: "Avatar", type: "image", full: true },
  { name: "order", label: "Order", type: "number", min: 0 },
  { name: "featured", label: "Featured", type: "switch" },
  { name: "published", label: "Published", type: "switch" },
];

const columns: EntityColumn[] = [
  {
    key: "name",
    label: "Client",
    render: (row) => (
      <div>
        <p className="font-medium">{String(row.name)}</p>
        <p className="text-xs text-muted-foreground">
          {[row.role, row.company].filter(Boolean).join(" · ") || ""}
        </p>
      </div>
    ),
  },
  {
    key: "content",
    label: "Testimonial",
    render: (row) => <span className="line-clamp-2 max-w-sm text-sm text-muted-foreground">{String(row.content)}</span>,
  },
  {
    key: "rating",
    label: "Rating",
    render: (row) => (
      <span className="inline-flex items-center gap-1 text-sm">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {Number(row.rating) || 5}/5
      </span>
    ),
  },
  { key: "published", label: "Status", render: (row) => <Badge variant={Boolean(row.published) ? "default" : "secondary"}>{Boolean(row.published) ? "Published" : "Hidden"}</Badge> },
];

export default function AdminTestimonialsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Testimonials" description="Client testimonials shown across the site." />
      <EntityManager entity="testimonial" title="testimonials" fields={fields} columns={columns} />
    </div>
  );
}
