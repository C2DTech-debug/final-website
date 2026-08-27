import { Request, Response } from "express";
import crypto from "crypto";
import { AgreementModel, type IAgreement, type AgreementStatus } from "../models/Agreement";
import { AgreementVersionModel } from "../models/AgreementVersion";
import { LeadModel } from "../models/Lead";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";
import { notify } from "../services/notificationService";
import { generateAgreementPdf } from "../services/agreementPdfService";
import { getSigningProvider, calculateAgreementHash, listSigningProviders } from "../services/signing";
import { logger } from "../utils/logger";

/**
 * Generates the next sequential agreement number (e.g. C2D-AGR-2026-0001).
 */
async function getNextAgreementNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `C2D-AGR-${currentYear}-`;
  const count = await AgreementModel.countDocuments({
    agreementNumber: { $regex: `^${prefix}` },
  });
  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}${seq}`;
}

/**
 * Generates a 32-byte cryptographically secure random token encoded as 64 hex characters.
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    ""
  );
}

// ============================================================================
// ADMIN CONTROLLERS
// ============================================================================

export const listAgreements = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { q, status, sort } = req.query;

  const filter: Record<string, unknown> = {};

  if (q) {
    filter.$or = [
      { agreementNumber: { $regex: q, $options: "i" } },
      { "client.name": { $regex: q, $options: "i" } },
      { "client.phone": { $regex: q, $options: "i" } },
      { "client.email": { $regex: q, $options: "i" } },
      { "client.company": { $regex: q, $options: "i" } },
      { "project.name": { $regex: q, $options: "i" } },
      { "agreementDetails.title": { $regex: q, $options: "i" } },
    ];
  }

  if (status && status !== "__all__") {
    filter.status = status;
  }

  const sortOptions: Record<string, 1 | -1> =
    sort === "oldest"
      ? { createdAt: 1 }
      : sort === "amount"
      ? { "project.totalAmount": -1 }
      : { createdAt: -1 };

  const total = await AgreementModel.countDocuments(filter);
  const data = await AgreementModel.find(filter)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("createdBy", "name email")
    .lean();

  res.status(200).json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const agreementStats = asyncHandler(async (_req: Request, res: Response) => {
  const [total, byStatus, signedValue, pipelineValue] = await Promise.all([
    AgreementModel.countDocuments(),
    AgreementModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    AgreementModel.aggregate([
      { $match: { status: "signed" } },
      { $group: { _id: null, total: { $sum: "$project.totalAmount" } } },
    ]),
    AgreementModel.aggregate([
      { $match: { status: { $in: ["draft", "sent", "viewed"] } } },
      { $group: { _id: null, total: { $sum: "$project.totalAmount" } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      draft: byStatus.find((s) => s._id === "draft")?.count || 0,
      sent: byStatus.find((s) => s._id === "sent")?.count || 0,
      viewed: byStatus.find((s) => s._id === "viewed")?.count || 0,
      signed: byStatus.find((s) => s._id === "signed")?.count || 0,
      expired: byStatus.find((s) => s._id === "expired")?.count || 0,
      cancelled: byStatus.find((s) => s._id === "cancelled")?.count || 0,
      signedValue: signedValue[0]?.total || 0,
      pipelineValue: pipelineValue[0]?.total || 0,
      byStatus,
    },
  });
});

export const getAgreement = asyncHandler(async (req: Request, res: Response) => {
  const doc = (await AgreementModel.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("client.leadId", "leadId name company phone email")
    .lean()) as unknown as (IAgreement & { _id: unknown }) | null;

  if (!doc) throw ApiError.notFound("Agreement not found");

  const versions = await AgreementVersionModel.find({ agreementId: doc._id })
    .sort({ version: -1 })
    .lean();


  res.status(200).json({
    success: true,
    data: {
      ...doc,
      versions,
    },
  });
});

export const createAgreement = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const agreementNumber = await getNextAgreementNumber();
  const publicToken = generateSecureToken();

  const totalAmount = Number(body.project.totalAmount || 0);
  const advancePercentage = Number(body.project.advancePercentage ?? 40);
  const advanceAmount =
    body.project.advanceAmount !== undefined && body.project.advanceAmount !== null
      ? Number(body.project.advanceAmount)
      : Math.round((totalAmount * advancePercentage) / 100);
  const finalPercentage = Number(body.project.finalPercentage ?? 60);
  const finalAmount =
    body.project.finalAmount !== undefined && body.project.finalAmount !== null
      ? Number(body.project.finalAmount)
      : totalAmount - advanceAmount;

  const agreement = await AgreementModel.create({
    agreementNumber,
    publicToken,
    version: 1,
    status: "draft",
    client: {
      name: body.client.name,
      phone: body.client.phone,
      email: body.client.email,
      address: body.client.address || "",
      company: body.client.company || "",
      leadId: body.client.leadId || undefined,
    },
    project: {
      name: body.project.name,
      description: body.project.description || "",
      scope: body.project.scope || "",
      totalAmount,
      currency: (body.project.currency || "INR").toUpperCase(),
      advancePercentage,
      advanceAmount,
      finalPercentage,
      finalAmount,
    },
    agreementDetails: {
      agreementDate: body.agreementDetails.agreementDate || new Date().toISOString().slice(0, 10),
      expiryDate: body.agreementDetails.expiryDate || "",
      title: body.agreementDetails.title,
      body: body.agreementDetails.body,
      termsAndConditions: body.agreementDetails.termsAndConditions || "",
      cancellationTerms: body.agreementDetails.cancellationTerms || "",
      supportTerms: body.agreementDetails.supportTerms || "",
      additionalNotes: body.agreementDetails.additionalNotes || "",
    },
    developer: {
      name: body.developer?.name || "Aravindar C",
      phone: body.developer?.phone || "+91 7904006320",
      email: body.developer?.email || "concept2deploytech@gmail.com",
      companyName: body.developer?.companyName || "C2D Tech (Concept to Deploy)",
      companyAddress:
        body.developer?.companyAddress ||
        "2/62 First Main Road, Ganesh Nagar, Kattur, Trichy-620019, Tamil Nadu, India",
      companyWebsite: body.developer?.companyWebsite || "https://c2dtech.com",
      logoUrl: body.developer?.logoUrl || "",
    },
    signing: {
      mode: body.signing?.mode || "digital_signature",
      provider: body.signing?.provider || "dsc_pkcs7",
    },
    auditTrail: [
      {
        timestamp: new Date(),
        action: "created",
        description: `Agreement created (v1) for ${body.client.name} - ${body.project.name}`,
        actor: req.user?.name || "Admin",
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"] || "",
      },
    ],
    createdBy: req.user?._id,
  });

  await logActivity({
    user: req.user,
    action: "create",
    entity: "agreement",
    entityId: agreement._id,
    description: `Created agreement ${agreement.agreementNumber} (${agreement.client.name})`,
    req,
  });

  res.status(201).json({ success: true, data: agreement });
});

export const updateAgreement = asyncHandler(async (req: Request, res: Response) => {
  const agreement = await AgreementModel.findById(req.params.id);
  if (!agreement) throw ApiError.notFound("Agreement not found");

  if (agreement.status === "signed") {
    throw ApiError.badRequest(
      "Signed agreements are immutable and cannot be modified. Please create a new version to make changes."
    );
  }

  const body = req.body;

  if (body.client) {
    agreement.client = {
      ...agreement.client,
      ...body.client,
    };
  }

  if (body.project) {
    const totalAmount =
      body.project.totalAmount !== undefined
        ? Number(body.project.totalAmount)
        : agreement.project.totalAmount;
    const advancePercentage =
      body.project.advancePercentage !== undefined
        ? Number(body.project.advancePercentage)
        : agreement.project.advancePercentage;
    const advanceAmount =
      body.project.advanceAmount !== undefined
        ? Number(body.project.advanceAmount)
        : Math.round((totalAmount * advancePercentage) / 100);
    const finalPercentage =
      body.project.finalPercentage !== undefined
        ? Number(body.project.finalPercentage)
        : agreement.project.finalPercentage;
    const finalAmount =
      body.project.finalAmount !== undefined
        ? Number(body.project.finalAmount)
        : totalAmount - advanceAmount;

    agreement.project = {
      ...agreement.project,
      ...body.project,
      totalAmount,
      advancePercentage,
      advanceAmount,
      finalPercentage,
      finalAmount,
    };
  }

  if (body.agreementDetails) {
    agreement.agreementDetails = {
      ...agreement.agreementDetails,
      ...body.agreementDetails,
    };
  }

  if (body.developer) {
    agreement.developer = {
      ...agreement.developer,
      ...body.developer,
    };
  }

  if (body.signing) {
    agreement.signing = {
      ...agreement.signing,
      ...body.signing,
    };
  }

  agreement.auditTrail.push({
    timestamp: new Date(),
    action: "updated",
    description: `Agreement v${agreement.version} updated by ${req.user?.name || "Admin"}`,
    actor: req.user?.name || "Admin",
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
  });

  await agreement.save();

  await logActivity({
    user: req.user,
    action: "update",
    entity: "agreement",
    entityId: agreement._id,
    description: `Updated agreement ${agreement.agreementNumber}`,
    req,
  });

  res.status(200).json({ success: true, data: agreement });
});

export const deleteAgreement = asyncHandler(async (req: Request, res: Response) => {
  const agreement = await AgreementModel.findById(req.params.id);
  if (!agreement) throw ApiError.notFound("Agreement not found");

  const wasSigned = agreement.status === "signed";

  await Promise.all([
    AgreementModel.findByIdAndDelete(agreement._id),
    AgreementVersionModel.deleteMany({ agreementId: agreement._id }),
  ]);

  await logActivity({
    user: req.user,
    action: "delete",
    entity: "agreement",
    entityId: agreement._id,
    description: wasSigned
      ? `Permanently deleted signed agreement ${agreement.agreementNumber} (Version ${agreement.version})`
      : `Deleted agreement ${agreement.agreementNumber}`,
    req,
  });

  res.status(200).json({
    success: true,
    message: wasSigned ? "Signed agreement permanently deleted" : "Agreement draft deleted",
  });
});

export const generateSigningLink = asyncHandler(async (req: Request, res: Response) => {
  const agreement = await AgreementModel.findById(req.params.id);
  if (!agreement) throw ApiError.notFound("Agreement not found");

  if (agreement.status === "draft") {
    agreement.status = "sent";
  }

  // Ensure token is high-entropy 64 hex characters
  if (!agreement.publicToken || agreement.publicToken.length < 32) {
    agreement.publicToken = generateSecureToken();
  }

  agreement.auditTrail.push({
    timestamp: new Date(),
    action: "link_generated",
    description: `Signing link generated and prepared for client by ${req.user?.name || "Admin"}`,
    actor: req.user?.name || "Admin",
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
  });

  await agreement.save();

  await logActivity({
    user: req.user,
    action: "link_generated",
    entity: "agreement",
    entityId: agreement._id,
    description: `Generated signing link for ${agreement.agreementNumber}`,
    req,
  });

  res.status(200).json({
    success: true,
    data: {
      publicToken: agreement.publicToken,
      status: agreement.status,
      signingUrl: `/agreement/${agreement.publicToken}`,
    },
  });
});

export const createNewVersion = asyncHandler(async (req: Request, res: Response) => {
  const agreement = await AgreementModel.findById(req.params.id);
  if (!agreement) throw ApiError.notFound("Agreement not found");

  // Preserve the current version in AgreementVersionModel if not already preserved
  const existingVersion = await AgreementVersionModel.findOne({
    agreementId: agreement._id,
    version: agreement.version,
  });

  if (!existingVersion) {
    await AgreementVersionModel.create({
      agreementId: agreement._id,
      agreementNumber: agreement.agreementNumber,
      version: agreement.version,
      status: agreement.status,
      snapshot: agreement.toObject(),
      documentHash: agreement.signing?.documentHash || "",
      signedAt: agreement.signing?.signedAt,
      signedDocumentUrl: agreement.signing?.signedDocumentUrl || "",
      signingProvider: agreement.signing?.provider || "",
      signingReference: agreement.signing?.providerReference || "",
      createdBy: req.user?._id,
    });
  }

  const nextVersionNum = agreement.version + 1;
  const newPublicToken = generateSecureToken();

  agreement.version = nextVersionNum;
  agreement.status = "draft";
  agreement.publicToken = newPublicToken;
  agreement.signing = {
    mode: agreement.signing?.mode || "digital_signature",
    provider: agreement.signing?.provider || "dsc_pkcs7",
  };

  agreement.auditTrail.push({
    timestamp: new Date(),
    action: "new_version_created",
    description: `Version ${nextVersionNum} created (draft) from Version ${agreement.version - 1} by ${req.user?.name || "Admin"}`,
    actor: req.user?.name || "Admin",
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
  });

  await agreement.save();

  await logActivity({
    user: req.user,
    action: "new_version",
    entity: "agreement",
    entityId: agreement._id,
    description: `Created Version ${nextVersionNum} for ${agreement.agreementNumber}`,
    req,
  });

  res.status(200).json({ success: true, data: agreement });
});

export const cancelAgreement = asyncHandler(async (req: Request, res: Response) => {
  const agreement = await AgreementModel.findById(req.params.id);
  if (!agreement) throw ApiError.notFound("Agreement not found");

  agreement.status = "cancelled";
  agreement.auditTrail.push({
    timestamp: new Date(),
    action: "cancelled",
    description: `Agreement cancelled by ${req.user?.name || "Admin"}`,
    actor: req.user?.name || "Admin",
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
  });

  await agreement.save();

  await logActivity({
    user: req.user,
    action: "cancel",
    entity: "agreement",
    entityId: agreement._id,
    description: `Cancelled agreement ${agreement.agreementNumber}`,
    req,
  });

  res.status(200).json({ success: true, data: agreement });
});

export const downloadAgreementPdf = asyncHandler(async (req: Request, res: Response) => {
  const agreement = await AgreementModel.findById(req.params.id);
  if (!agreement) throw ApiError.notFound("Agreement not found");

  agreement.auditTrail.push({
    timestamp: new Date(),
    action: "downloaded",
    description: `PDF downloaded by ${req.user?.name || "Admin"}`,
    actor: req.user?.name || "Admin",
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
  });
  await agreement.save();

  await generateAgreementPdf(agreement, res);
});

// ============================================================================
// PUBLIC CLIENT CONTROLLERS
// ============================================================================

export const getPublicAgreement = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token || typeof token !== "string" || token.length < 32) {
    throw ApiError.notFound("Invalid or expired agreement link");
  }

  const agreement = await AgreementModel.findOne({ publicToken: token });
  if (!agreement) {
    throw ApiError.notFound("Agreement not found or link has expired");
  }

  const clientIp = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";

  // If status is 'sent', update to 'viewed' upon client opening
  if (agreement.status === "sent") {
    agreement.status = "viewed";
    agreement.auditTrail.push({
      timestamp: new Date(),
      action: "viewed",
      description: `Agreement opened and viewed by client (${agreement.client.name})`,
      actor: agreement.client.name,
      ip: clientIp,
      userAgent,
    });
    await agreement.save();
  }

  res.status(200).json({
    success: true,
    data: {
      agreementNumber: agreement.agreementNumber,
      version: agreement.version,
      status: agreement.status,
      client: {
        name: agreement.client.name,
        phone: agreement.client.phone,
        email: agreement.client.email,
        company: agreement.client.company,
        address: agreement.client.address,
      },
      project: agreement.project,
      agreementDetails: agreement.agreementDetails,
      developer: agreement.developer,
      signing: {
        mode: agreement.signing?.mode,
        provider: agreement.signing?.provider,
        signedAt: agreement.signing?.signedAt,
        signerName: agreement.signing?.signerName,
        documentHash: agreement.signing?.documentHash,
        signatureAlgorithm: agreement.signing?.signatureAlgorithm,
        digitalSignatureValue: agreement.signing?.digitalSignatureValue,
        certificateIssuer: agreement.signing?.certificateIssuer,
        certificateInfo: agreement.signing?.certificateInfo,
        providerReference: agreement.signing?.providerReference,
      },
      availableProviders: listSigningProviders(),
    },
  });
});

export const signPublicAgreement = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const body = req.body;

  if (!token || typeof token !== "string" || token.length < 32) {
    throw ApiError.notFound("Invalid agreement token");
  }

  const agreement = await AgreementModel.findOne({ publicToken: token });
  if (!agreement) {
    throw ApiError.notFound("Agreement not found");
  }

  if (agreement.status === "signed") {
    return res.status(200).json({
      success: true,
      message: "Agreement is already digitally signed",
      data: {
        agreementNumber: agreement.agreementNumber,
        status: agreement.status,
        signedAt: agreement.signing.signedAt,
        documentHash: agreement.signing.documentHash,
        signatureAlgorithm: agreement.signing.signatureAlgorithm,
        providerReference: agreement.signing.providerReference,
      },
    });
  }

  if (agreement.status === "cancelled" || agreement.status === "expired") {
    throw ApiError.badRequest(`Cannot sign this agreement because it is ${agreement.status}`);
  }

  const clientIp = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";

  const selectedProviderId = body.signingProvider || agreement.signing?.provider || "dsc_pkcs7";
  const provider = getSigningProvider(selectedProviderId);

  const signResult = await provider.executeSigning(agreement, {
    signerName: body.signerName,
    signerEmail: body.signerEmail || agreement.client.email,
    signerPhone: body.signerPhone || agreement.client.phone,
    signatureImage: body.signatureImage,
    signatureType: body.signatureType || "drawn",
    ip: clientIp,
    userAgent,
    certificatePin: body.certificatePin,
    otpToken: body.otpToken,
  });

  if (!signResult.success) {
    throw ApiError.internal("Digital signature execution failed. Please try again.");
  }

  // Update agreement to signed status with cryptographic signature metadata
  agreement.status = "signed";
  agreement.signing.provider = signResult.provider;
  agreement.signing.providerReference = signResult.providerReference;
  agreement.signing.documentHash = signResult.documentHash;
  agreement.signing.signatureAlgorithm = signResult.signatureAlgorithm;
  agreement.signing.digitalSignatureValue = signResult.digitalSignatureValue;
  agreement.signing.certificateIssuer = signResult.certificateIssuer;
  agreement.signing.signatureImage = signResult.signatureImage || body.signatureImage || "";
  agreement.signing.signatureType = signResult.signatureType || body.signatureType || "drawn";
  agreement.signing.signedAt = signResult.signedAt;
  agreement.signing.signerName = body.signerName;
  agreement.signing.signerEmail = body.signerEmail || agreement.client.email;
  agreement.signing.signerPhone = body.signerPhone || agreement.client.phone;
  agreement.signing.signerIp = clientIp;
  agreement.signing.signerUserAgent = userAgent;
  agreement.signing.certificateInfo = signResult.certificateInfo || "";

  agreement.auditTrail.push({
    timestamp: signResult.signedAt,
    action: "signed",
    description: `Agreement digitally signed by ${body.signerName} (${body.signerPhone}) [${body.signatureType || "drawn"} signature] via ${provider.name}`,
    actor: body.signerName,
    ip: clientIp,
    userAgent,
    documentHash: signResult.documentHash,
    meta: {
      provider: signResult.provider,
      providerReference: signResult.providerReference,
      signatureAlgorithm: signResult.signatureAlgorithm,
      signatureType: body.signatureType || "drawn",
      certificateIssuer: signResult.certificateIssuer,
    },
  });

  await agreement.save();

  // Create immutable version snapshot in AgreementVersionModel
  await AgreementVersionModel.findOneAndUpdate(
    { agreementId: agreement._id, version: agreement.version },
    {
      agreementId: agreement._id,
      agreementNumber: agreement.agreementNumber,
      version: agreement.version,
      status: "signed",
      snapshot: agreement.toObject(),
      documentHash: signResult.documentHash,
      signedAt: signResult.signedAt,
      signingProvider: signResult.provider,
      signingReference: signResult.providerReference,
      signatureImage: signResult.signatureImage || body.signatureImage || "",
      signatureType: body.signatureType || "drawn",
    },
    { upsert: true, new: true }
  );

  // Send admin notification
  await notify({
    type: "system",
    title: "Agreement Signed",
    message: `${agreement.agreementNumber} signed by ${body.signerName} for ${agreement.project.name}`,
    entityType: "agreement",
    entityId: agreement.agreementNumber,
    link: "/admin/agreements",
  });

  await logActivity({
    user: null,
    action: "signed",
    entity: "agreement",
    entityId: agreement._id,
    description: `${agreement.agreementNumber} electronically signed by ${body.signerName}`,
    req,
  });

  res.status(200).json({
    success: true,
    message: "Agreement successfully signed and preserved",
    data: {
      agreementNumber: agreement.agreementNumber,
      status: agreement.status,
      signedAt: agreement.signing.signedAt,
      documentHash: agreement.signing.documentHash,
      providerReference: agreement.signing.providerReference,
    },
  });
});

export const downloadPublicAgreementPdf = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token || typeof token !== "string" || token.length < 32) {
    throw ApiError.notFound("Invalid agreement token");
  }

  const agreement = await AgreementModel.findOne({ publicToken: token });
  if (!agreement) {
    throw ApiError.notFound("Agreement not found");
  }

  const clientIp = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";

  agreement.auditTrail.push({
    timestamp: new Date(),
    action: "downloaded",
    description: `PDF downloaded by client (${agreement.client.name})`,
    actor: agreement.client.name,
    ip: clientIp,
    userAgent,
  });
  await agreement.save();

  await generateAgreementPdf(agreement, res);
});
