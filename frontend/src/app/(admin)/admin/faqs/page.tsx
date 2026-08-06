"use client";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { EntityManager, type EntityColumn, type EntityField } from "@/components/admin/entity-manager";

const fields: EntityField[] = [
  { name: "question", label: "Question", type: "text", required: true, full: true, placeholder: "How long does a typical project take?" },
  { name: "answer", label: "Answer", type: "textarea", required: true, full: true },
  { name: "category", label: "Category", type: "text", placeholder: "general" },
  { name: "order", label: "Order", type: "number", min: 0 },
  { name: "published", label: "Published", type: "switch" },
];

const columns: EntityColumn[] = [
  {
    key: "question",
    label: "Question",
    render: (row) => <span className="font-medium">{String(row.question)}</span>,
  },
  { key: "category", label: "Category", render: (row) => <Badge variant="secondary">{String(row.category || "general")}</Badge> },
  { key: "published", label: "Status", render: (row) => <Badge variant={Boolean(row.published) ? "default" : "secondary"}>{Boolean(row.published) ? "Published" : "Hidden"}</Badge> },
];

export default function AdminFaqsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="FAQs" description="Frequently asked questions for the FAQ section." />
      <EntityManager entity="faq" title="faqs" fields={fields} columns={columns} />
    </div>
  );
}
