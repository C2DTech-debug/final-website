"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { EntityManager, type EntityColumn, type EntityField } from "@/components/admin/entity-manager";

const fields: EntityField[] = [
  { name: "name", label: "Name", type: "text", required: true, placeholder: "Priya Kumar" },
  { name: "position", label: "Position", type: "text", required: true, placeholder: "Full Stack Developer" },
  { name: "bio", label: "Bio", type: "textarea", full: true },
  { name: "skills", label: "Skills", type: "tags", full: true },
  { name: "photo", label: "Photo", type: "image", full: true },
  { name: "email", label: "Email", type: "text" },
  { name: "socialLinks.github", label: "GitHub URL", type: "text" },
  { name: "socialLinks.linkedin", label: "LinkedIn URL", type: "text" },
  { name: "socialLinks.twitter", label: "Twitter URL", type: "text" },
  { name: "socialLinks.website", label: "Website", type: "text" },
  { name: "order", label: "Order", type: "number", min: 0 },
  { name: "published", label: "Published", type: "switch" },
];

const columns: EntityColumn[] = [
  {
    key: "name",
    label: "Member",
    render: (row) => (
      <div className="flex items-center gap-3">
        {row.photo ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border">
            <Image src={String(row.photo)} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-full border bg-muted" />
        )}
        <div>
          <p className="font-medium">{String(row.name)}</p>
          <p className="text-xs text-muted-foreground">{String(row.position || "")}</p>
        </div>
      </div>
    ),
  },
  { key: "email", label: "Email", render: (row) => <span className="text-sm">{String(row.email || "—")}</span> },
  { key: "published", label: "Status", render: (row) => <Badge variant={Boolean(row.published) ? "default" : "secondary"}>{Boolean(row.published) ? "Published" : "Hidden"}</Badge> },
];

export default function AdminTeamPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Team" description="Team members shown on the team page." />
      <EntityManager entity="team" title="members" fields={fields} columns={columns} />
    </div>
  );
}
