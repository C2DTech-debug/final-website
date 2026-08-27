import { Request, Response } from "express";
import { ContactMessageModel } from "../models/ContactMessage";
import { NewsletterSubscriberModel } from "../models/NewsletterSubscriber";
import { ProjectEstimateModel } from "../models/ProjectEstimate";
import { LeadModel } from "../models/Lead";
import { JobApplicationModel } from "../models/JobApplication";
import { AgreementModel } from "../models/Agreement";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((h) => esc(row[h])).join(","));
  return lines.join("\r\n");
}

async function exportContacts(): Promise<{ rows: Record<string, unknown>[]; filename: string }> {
  const docs = await ContactMessageModel.find().sort({ createdAt: -1 }).lean();
  return {
    rows: docs.map((d) => ({
      id: d._id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      service: d.service,
      budget: d.budget,
      timeline: d.timeline,
      status: d.status,
      message: d.message,
      createdAt: d.createdAt,
    })),
    filename: "contacts",
  };
}

async function exportSubscribers(): Promise<{ rows: Record<string, unknown>[]; filename: string }> {
  const docs = await NewsletterSubscriberModel.find().sort({ createdAt: -1 }).lean();
  return {
    rows: docs.map((d) => ({ id: d._id, email: d.email, name: d.name, status: d.status, source: d.source, createdAt: d.createdAt })),
    filename: "subscribers",
  };
}

async function exportEstimates(): Promise<{ rows: Record<string, unknown>[]; filename: string }> {
  const docs = await ProjectEstimateModel.find().sort({ createdAt: -1 }).lean();
  return {
    rows: docs.map((d) => ({
      id: d._id,
      name: d.name,
      email: d.email,
      services: (d.serviceNames || []).join(", "),
      addons: (d.addons || []).join(", "),
      totalCost: d.totalCost,
      currency: d.currency,
      timeline: d.timeline,
      status: d.status,
      createdAt: d.createdAt,
    })),
    filename: "estimates",
  };
}

async function exportLeads(): Promise<{ rows: Record<string, unknown>[]; filename: string }> {
  const docs = (await LeadModel.find().sort({ createdAt: -1 }).lean()) as unknown as Record<string, unknown>[];
  return {
    rows: docs.map((d) => ({
      leadId: d.leadId,
      name: d.name,
      company: d.company,
      email: d.email,
      phone: d.phone,
      whatsapp: d.whatsapp,
      city: d.city,
      state: d.state,
      country: d.country,
      businessType: d.businessType,
      service: d.service,
      budget: d.budget,
      priority: d.priority,
      source: d.source,
      status: d.status,
      assignedTo: d.assignedTo,
      followUpDate: d.followUpDate,
      expectedClosingDate: d.expectedClosingDate,
      tags: Array.isArray(d.tags) ? d.tags.join(" | ") : "",
      createdAt: d.createdAt,
    })),
    filename: "leads",
  };
}

async function exportApplications(): Promise<{ rows: Record<string, unknown>[]; filename: string }> {
  const docs = (await JobApplicationModel.find().sort({ createdAt: -1 }).lean()) as unknown as Record<string, unknown>[];
  return {
    rows: docs.map((d) => ({
      name: d.name,
      email: d.email,
      phone: d.phone,
      position: d.job,
      resume: d.resumeUrl,
      status: d.status,
      linkedin: d.linkedin,
      portfolio: d.portfolio,
      expectedSalary: d.expectedSalary,
      createdAt: d.createdAt,
    })),
    filename: "applications",
  };
}

async function exportAgreements(): Promise<{ rows: Record<string, unknown>[]; filename: string }> {
  const docs = (await AgreementModel.find().sort({ createdAt: -1 }).lean()) as unknown as Record<string, any>[];
  return {
    rows: docs.map((d) => ({
      agreementNumber: d.agreementNumber,
      version: d.version,
      status: d.status,
      clientName: d.client?.name,
      clientPhone: d.client?.phone,
      clientEmail: d.client?.email,
      clientCompany: d.client?.company,
      projectName: d.project?.name,
      totalAmount: d.project?.totalAmount,
      currency: d.project?.currency,
      advanceAmount: d.project?.advanceAmount,
      finalAmount: d.project?.finalAmount,
      signedAt: d.signing?.signedAt,
      signedBy: d.signing?.signerName,
      documentHash: d.signing?.documentHash,
      createdAt: d.createdAt,
    })),
    filename: "agreements",
  };
}

const SOURCES: Record<string, () => Promise<{ rows: Record<string, unknown>[]; filename: string }>> = {
  contacts: exportContacts,
  subscribers: exportSubscribers,
  estimates: exportEstimates,
  leads: exportLeads,
  applications: exportApplications,
  agreements: exportAgreements,
};

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const source = SOURCES[req.params.type];
  if (!source) throw ApiError.notFound("Unknown export type");
  const { rows, filename } = await source();
  await logActivity({ user: req.user, action: "export", entity: req.params.type, description: `Exported ${rows.length} ${req.params.type} to CSV`, req });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}-${Date.now()}.csv"`);
  res.send(toCsv(rows));
});

export const exportExcel = asyncHandler(async (req: Request, res: Response) => {
  const source = SOURCES[req.params.type];
  if (!source) throw ApiError.notFound("Unknown export type");
  const ExcelJS = require("exceljs");
  const { rows, filename } = await source();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(filename);
  if (rows.length > 0) {
    sheet.addRow(Object.keys(rows[0]));
    sheet.getRow(1).font = { bold: true };
    for (const row of rows) sheet.addRow(Object.values(row));
  }
  await logActivity({ user: req.user, action: "export", entity: req.params.type, description: `Exported ${rows.length} ${req.params.type} to Excel`, req });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}-${Date.now()}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

export const exportPdf = asyncHandler(async (req: Request, res: Response) => {
  const source = SOURCES[req.params.type];
  if (!source) throw ApiError.notFound("Unknown export type");
  const PDFDocument = require("pdfkit");
  const { rows, filename } = await source();

  const doc = new PDFDocument({ margin: 36, size: "A4", layout: rows.length > 8 ? "landscape" : "portrait" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}-${Date.now()}.pdf"`);
  doc.pipe(res);

  doc.fontSize(16).text(`C2D Tech — ${filename.toUpperCase()} Export`, { align: "center" });
  doc.moveDown();

  if (rows.length > 0) {
    const headers = Object.keys(rows[0]);
    const usable = doc.page.width - 72;
    const colWidth = usable / headers.length;
    doc.fontSize(8);
    doc.font("Helvetica-Bold");
    headers.forEach((h, i) => doc.text(h, 36 + i * colWidth, doc.y, { width: colWidth - 4 }));
    doc.moveDown(0.5);
    doc.font("Helvetica");
    for (const row of rows) {
      const y = doc.y;
      const cellMax = Math.max(...headers.map((h) => String(row[h] || "").length * 4.2));
      headers.forEach((h, i) => doc.text(String(row[h] || ""), 36 + i * colWidth, y, { width: colWidth - 4 }));
      doc.moveDown(0.6);
      void cellMax;
    }
  }
  doc.end();
  await logActivity({ user: req.user, action: "export", entity: req.params.type, description: `Exported ${rows.length} ${req.params.type} to PDF`, req });
});
