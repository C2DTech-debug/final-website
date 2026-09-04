import { Request, Response } from "express";
import path from "path";
import { LeadModel } from "../models/Lead";
import { LeadNoteModel } from "../models/LeadNote";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";
import { notify } from "../services/notificationService";

const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal_sent", "negotiation", "follow_up", "won", "lost", "on_hold"] as const;

const POPULATE = [
  { path: "assignedTo", select: "name email" },
  { path: "createdBy", select: "name email" },
];

function statusHasChanged(existing: Record<string, unknown>, next?: string): boolean {
  return Boolean(next && existing.status !== next);
}

// ---------- List / Get ----------

export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { q, status, source, priority, assignedTo, tag, startDate, endDate, sort } = req.query;

  const filter: Record<string, unknown> = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      { company: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { leadId: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
    ];
  }
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (tag) filter.tags = tag;
  if (startDate || endDate) {
    filter.createdAt = {} as Record<string, unknown>;
    if (startDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
    if (endDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate as string);
  }

  const sortOptions: Record<string, 1 | -1> =
    sort === "oldest" ? { createdAt: 1 } : sort === "name" ? { name: 1 } : sort === "priority" ? { priority: 1 } : { createdAt: -1 };

  const total = await LeadModel.countDocuments(filter);
  const data = (await LeadModel.find(filter).sort(sortOptions).skip((page - 1) * limit).limit(limit).populate(POPULATE).lean()) as unknown as Record<string, unknown>[];

  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getLead = asyncHandler(async (req: Request, res: Response) => {
  const doc = (await LeadModel.findById(req.params.id).populate(POPULATE).lean()) as unknown as
    | (Record<string, unknown> & { _id: unknown })
    | null;
  if (!doc) throw ApiError.notFound("Lead not found");
  const notes = (await LeadNoteModel.find({ lead: doc._id }).sort({ createdAt: -1 }).populate("by", "name email").lean()) as unknown as Record<string, unknown>[];
  res.status(200).json({ success: true, data: { ...doc, notes } });
});

// ---------- Create / Update / Delete ----------

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const lead = await LeadModel.create({
    ...body,
    source: body.source || "manual",
    createdBy: req.user!._id,
    createdByName: req.user!.name || "Admin",
    assignedTo: body.assignedTo || null,
    timeline: [{ action: "created", description: `Lead created by ${req.user!.name || "Admin"}`, by: req.user!._id, byName: req.user!.name }],
  });
  await lead.populate(POPULATE);
  await logActivity({ user: req.user, action: "create", entity: "lead", entityId: lead._id, description: `Created lead ${lead.leadId} (${lead.name})`, req });
  res.status(201).json({ success: true, data: lead });
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const doc = await LeadModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Lead not found");
  const body = req.body;
  const changed = statusHasChanged(doc.toObject(), body.status);

  doc.set(body);
  if (body.assignedTo === "") doc.assignedTo = null;
  if (changed) {
    doc.timeline.push({ action: "status_change", description: `Status changed to ${body.status}`, by: req.user!._id, byName: req.user!.name });
  }
  if (body.followUpDate && body.followUpDate !== doc.followUpDate) {
    doc.timeline.push({ action: "follow_up", description: `Follow-up scheduled for ${new Date(body.followUpDate).toLocaleDateString()}`, by: req.user!._id, byName: req.user!.name });
  }
  await doc.save();
  await doc.populate(POPULATE);

  await logActivity({ user: req.user, action: "update", entity: "lead", entityId: req.params.id, description: `Updated lead ${doc.leadId} (${doc.name})`, req });
  res.status(200).json({ success: true, data: doc });
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  const doc = await LeadModel.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("Lead not found");
  await LeadNoteModel.deleteMany({ lead: doc._id });
  await logActivity({ user: req.user, action: "delete", entity: "lead", entityId: req.params.id, description: `Deleted lead ${doc.leadId} (${doc.name})`, req });
  res.status(200).json({ success: true, data: { message: "Lead deleted" } });
});

// ---------- Pipeline / status ----------

export const updateLeadStatus = asyncHandler(async (req: Request, res: Response) => {
  const doc = await LeadModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Lead not found");
  const { status } = req.body;
  if (status === doc.status) return res.status(200).json({ success: true, data: doc });

  const previous = doc.status;
  doc.status = status;
  if (status === "won") doc.expectedClosingDate = doc.expectedClosingDate || new Date();
  doc.timeline.push({ action: "status_change", description: `Status changed from ${previous} to ${status}`, by: req.user!._id, byName: req.user!.name });
  await doc.save();

  await logActivity({ user: req.user, action: "status_change", entity: "lead", entityId: req.params.id, description: `${doc.leadId} moved to "${status}"`, req });
  res.status(200).json({ success: true, data: doc });
});

// ---------- Notes ----------

export const addLeadNote = asyncHandler(async (req: Request, res: Response) => {
  const lead = await LeadModel.findById(req.params.id);
  if (!lead) throw ApiError.notFound("Lead not found");
  const note = await LeadNoteModel.create({ lead: lead._id, body: req.body.body, by: req.user!._id, byName: req.user!.name });
  lead.timeline.push({ action: "note", description: "Internal note added", by: req.user!._id, byName: req.user!.name });
  await lead.save();
  await logActivity({ user: req.user, action: "note", entity: "lead", entityId: req.params.id, description: `Note added to ${lead.leadId}`, req });
  res.status(201).json({ success: true, data: note });
});

export const deleteLeadNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await LeadNoteModel.findByIdAndDelete(req.params.noteId);
  if (!note) throw ApiError.notFound("Note not found");
  await logActivity({ user: req.user, action: "delete", entity: "lead_note", entityId: req.params.noteId, description: "Lead note deleted", req });
  res.status(200).json({ success: true, data: { message: "Note deleted" } });
});

// ---------- Assignment / transfer ----------

export const assignLead = asyncHandler(async (req: Request, res: Response) => {
  const doc = await LeadModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Lead not found");
  const previous = doc.assignedTo ? String(doc.assignedTo) : null;
  doc.assignedTo = req.body.assignedTo || null;
  doc.timeline.push({
    action: "assign",
    description: `Reassigned ${previous ? "to a new owner" : "from unassigned"}`,
    by: req.user!._id,
    byName: req.user!.name,
  });
  await doc.save();
  await logActivity({ user: req.user, action: "assign", entity: "lead", entityId: req.params.id, description: `Assigned ${doc.leadId}`, req });
  res.status(200).json({ success: true, data: doc });
});

// ---------- Duplicate detection / merge ----------

function norm(v: unknown): string {
  return String(v || "").trim().toLowerCase();
}

export const findDuplicates = asyncHandler(async (_req: Request, res: Response) => {
  const leads = await LeadModel.find().select("_id leadId name email phone company createdAt").lean();
  const seen = new Map<string, typeof leads>();
  const duplicates: { group: (typeof leads)[number][]; matchedOn: string }[] = [];

  for (const lead of leads) {
    const email = norm(lead.email);
    const phone = norm(lead.phone);
    const name = norm(lead.name);
    const keys: string[] = [];
    if (email) keys.push(`e:${email}`);
    if (phone) keys.push(`p:${phone}`);
    if (name && (email || phone)) keys.push(`n:${name}`);
    for (const key of keys) {
      const group = seen.get(key);
      if (group) {
        const existing = duplicates.find((d) => d.group.includes(group[0]));
        if (existing) {
          if (!existing.group.includes(lead)) existing.group.push(lead);
        } else {
          duplicates.push({ group: [...group, lead], matchedOn: key.startsWith("e:") ? "email" : key.startsWith("p:") ? "phone" : "name" });
        }
      }
    }
    for (const key of keys) {
      if (!seen.has(key)) seen.set(key, [lead]);
    }
  }

  res.status(200).json({ success: true, data: duplicates });
});

export const mergeLeads = asyncHandler(async (req: Request, res: Response) => {
  const { primaryId, secondaryIds } = req.body as { primaryId: string; secondaryIds: string[] };
  if (!primaryId || !Array.isArray(secondaryIds) || secondaryIds.length === 0) {
    throw ApiError.badRequest("Provide a primary lead and at least one secondary lead to merge");
  }
  const primary = await LeadModel.findById(primaryId);
  if (!primary) throw ApiError.notFound("Primary lead not found");
  if (secondaryIds.includes(primaryId)) throw ApiError.badRequest("Primary lead cannot be merged into itself");

  const secondaries = await LeadModel.find({ _id: { $in: secondaryIds } });
  for (const sec of secondaries) {
    for (const note of await LeadNoteModel.find({ lead: sec._id })) {
      await LeadNoteModel.updateOne({ _id: note._id }, { $set: { lead: primary._id } });
    }
    primary.timeline.push(...sec.timeline);
    primary.timeline.push({ action: "merge", description: `Merged duplicate ${sec.leadId} into this lead`, by: req.user!._id, byName: req.user!.name });
    if (!primary.tags.some((t: string) => sec.tags.includes(t))) {
      primary.tags = [...new Set([...primary.tags, ...sec.tags])];
    }
    await sec.deleteOne();
  }
  await primary.save();
  await logActivity({ user: req.user, action: "merge", entity: "lead", entityId: primaryId, description: `Merged ${secondaries.length} duplicate lead(s) into ${primary.leadId}`, req });
  res.status(200).json({ success: true, data: { message: `Merged ${secondaries.length} lead(s)`, lead: primary } });
});

// ---------- Timeline ----------

export const addTimelineEntry = asyncHandler(async (req: Request, res: Response) => {
  const doc = await LeadModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Lead not found");
  doc.timeline.push({ action: req.body.action, description: req.body.description || "", by: req.user!._id, byName: req.user!.name });
  await doc.save();
  res.status(200).json({ success: true, data: doc });
});

// ---------- Kanban / dashboard widgets ----------

export const kanbanBoard = asyncHandler(async (req: Request, res: Response) => {
  const { source, assignedTo } = req.query;
  const filter: Record<string, unknown> = {};
  if (source) filter.source = source;
  if (assignedTo) filter.assignedTo = assignedTo;

  const leads = await LeadModel.find(filter).sort({ updatedAt: -1 }).populate(POPULATE).lean();
  const columns = LEAD_STATUSES.map((status) => ({
    status,
    leads: leads.filter((l) => l.status === status),
  }));
  res.status(200).json({ success: true, data: columns });
});

export const leadStats = asyncHandler(async (_req: Request, res: Response) => {
  const [total, byStatus, bySource, byPriority, upcomingFollowUps, revenueForecast, monthGroup] = await Promise.all([
    LeadModel.countDocuments(),
    LeadModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    LeadModel.aggregate([{ $group: { _id: "$source", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    LeadModel.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
    LeadModel.find({ followUpDate: { $gte: new Date() }, status: { $nin: ["won", "lost"] } })
      .sort({ followUpDate: 1 })
      .limit(10)
      .select("leadId name status followUpDate assignedTo")
      .populate("assignedTo", "name")
      .lean(),
    LeadModel.aggregate([
      { $match: { status: "won" } },
      { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: [{ $arrayElemAt: [{ $split: ["$budget", " "] }, 0] }, "0"] } } } } },
    ]),
    LeadModel.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      byStatus,
      bySource,
      byPriority,
      upcomingFollowUps,
      revenueForecast: revenueForecast[0]?.total || 0,
      monthlyTrend: monthGroup,
    },
  });
});

// ---------- CSV import helper (used by admin import route) ----------

export async function importLeadsFromRows(rows: Record<string, unknown>[], userId: string) {
  const created = [];
  for (const row of rows) {
    const name = row.name || `${row.firstName || ""} ${row.lastName || ""}`.trim();
    if (!name) continue;
    const lead = await LeadModel.create({
      name,
      company: row.company || "",
      email: row.email || "",
      phone: row.phone || "",
      whatsapp: row.whatsapp || "",
      city: row.city || "",
      state: row.state || "",
      country: row.country || "India",
      businessType: row.businessType || "",
      service: row.service || "",
      budget: row.budget || "",
      priority: (row.priority as string) || "medium",
      source: (row.source as string) || "import",
      status: (row.status as string) || "new",
      tags: Array.isArray(row.tags) ? row.tags : String(row.tags || "").split(",").map((s) => s.trim()).filter(Boolean),
      createdBy: userId,
      timeline: [{ action: "import", description: "Imported from CSV", by: userId }],
    });
    created.push(lead);
  }
  return created;
}

function parseCsv(text: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((r) => r.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== "" || row.length > 0) { row.push(cell); if (row.some((r) => r.trim() !== "")) rows.push(row); }
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => { obj[h] = r[idx] ?? ""; });
    return obj;
  });
}

export const importLeadsFile = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) throw ApiError.badRequest("Upload a CSV or Excel file (.csv, .xlsx)");
  const ext = path.extname(file.originalname).toLowerCase();
  let rows: Record<string, unknown>[] = [];

  try {
    if (ext === ".csv") {
      rows = parseCsv(file.buffer.toString("utf8"));
    } else if (ext === ".xlsx" || ext === ".xls") {
      const ExcelJS = require("exceljs");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer);
      const sheet = workbook.worksheets[0];
      if (sheet) {
        const headerRow = sheet.getRow(1);
        const headers = (headerRow.values as unknown[]).slice(1).map((h) => String(h ?? "").trim().toLowerCase());
        sheet.eachRow((r: { values: unknown }, rowNumber: number) => {
          if (rowNumber === 1) return;
          const obj: Record<string, unknown> = {};
          (r.values as unknown[]).slice(1).forEach((v, idx) => { obj[headers[idx]] = v ?? ""; });
          rows.push(obj);
        });
      }
    } else {
      throw ApiError.badRequest("Only .csv and .xlsx files are supported");
    }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw ApiError.badRequest("Could not parse the uploaded file: " + (e instanceof Error ? e.message : "unknown"));
  }

  const created = await importLeadsFromRows(rows, String(req.user!._id));
  await logActivity({ user: req.user, action: "import", entity: "lead", description: `Imported ${created.length} lead(s) from file`, details: { total: rows.length }, req });
  res.status(201).json({ success: true, data: { imported: created.length, skipped: rows.length - created.length } });
});
