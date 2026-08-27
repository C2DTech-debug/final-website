import { Schema, model, models, type Document } from "mongoose";

export const AGREEMENT_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "signed",
  "expired",
  "cancelled",
] as const;

export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number];

export interface IAuditTrailEntry {
  timestamp: Date;
  action: string;
  description: string;
  actor?: string;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
  documentHash?: string;
}

export interface IAgreement extends Document {
  agreementNumber: string;
  publicToken: string;
  version: number;
  status: AgreementStatus;
  
  // Client details
  client: {
    name: string;
    phone: string;
    email: string;
    address: string;
    company?: string;
    leadId?: Schema.Types.ObjectId;
  };

  // Project details
  project: {
    name: string;
    description: string;
    scope: string;
    totalAmount: number;
    currency: string;
    advancePercentage: number;
    advanceAmount: number;
    finalPercentage: number;
    finalAmount: number;
  };

  // Agreement Content & Terms
  agreementDetails: {
    agreementDate: string;
    expiryDate?: string;
    title: string;
    body: string; // Rich text HTML
    termsAndConditions: string;
    cancellationTerms: string;
    supportTerms: string;
    additionalNotes?: string;
  };

  // Company / Developer info
  developer: {
    name: string;
    phone: string;
    email: string;
    companyName: string;
    companyAddress: string;
    companyWebsite: string;
    logoUrl?: string;
  };

  // Signing details
  signing: {
    mode: "digital_signature" | "cca_esign";
    provider: "dsc_pkcs7" | "emudhra" | "protean" | "cdac";
    providerReference?: string;
    signerName?: string;
    signerEmail?: string;
    signerPhone?: string;
    signedAt?: Date;
    signerIp?: string;
    signerUserAgent?: string;
    documentHash?: string;
    signatureAlgorithm?: string;
    digitalSignatureValue?: string;
    certificateIssuer?: string;
    certificateInfo?: string;
    signatureImage?: string;
    signatureType?: "drawn" | "typed";
    signedDocumentUrl?: string;
  };

  auditTrail: IAuditTrailEntry[];
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const auditTrailSchema = new Schema<IAuditTrailEntry>(
  {
    timestamp: { type: Date, default: Date.now },
    action: { type: String, required: true },
    description: { type: String, required: true },
    actor: { type: String, default: "System" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    meta: { type: Schema.Types.Mixed },
    documentHash: { type: String, default: "" },
  },
  { _id: true }
);

const agreementSchema = new Schema<IAgreement>(
  {
    agreementNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    publicToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: AGREEMENT_STATUSES,
      default: "draft",
      index: true,
    },

    client: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      address: { type: String, default: "", trim: true },
      company: { type: String, default: "", trim: true },
      leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    },

    project: {
      name: { type: String, required: true, trim: true },
      description: { type: String, default: "", trim: true },
      scope: { type: String, default: "", trim: true },
      totalAmount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "INR", uppercase: true },
      advancePercentage: { type: Number, default: 40, min: 0, max: 100 },
      advanceAmount: { type: Number, default: 0, min: 0 },
      finalPercentage: { type: Number, default: 60, min: 0, max: 100 },
      finalAmount: { type: Number, default: 0, min: 0 },
    },

    agreementDetails: {
      agreementDate: { type: String, required: true },
      expiryDate: { type: String, default: "" },
      title: { type: String, required: true, trim: true },
      body: { type: String, required: true },
      termsAndConditions: { type: String, default: "" },
      cancellationTerms: { type: String, default: "" },
      supportTerms: { type: String, default: "" },
      additionalNotes: { type: String, default: "" },
    },

    developer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      companyName: { type: String, required: true, trim: true },
      companyAddress: { type: String, required: true, trim: true },
      companyWebsite: { type: String, required: true, trim: true },
      logoUrl: { type: String, default: "" },
    },

    signing: {
      mode: {
        type: String,
        enum: ["digital_signature", "cca_esign"],
        default: "digital_signature",
      },
      provider: {
        type: String,
        enum: ["dsc_pkcs7", "emudhra", "protean", "cdac"],
        default: "dsc_pkcs7",
      },
      providerReference: { type: String, default: "" },
      signerName: { type: String, default: "" },
      signerEmail: { type: String, default: "" },
      signerPhone: { type: String, default: "" },
      signedAt: { type: Date },
      signerIp: { type: String, default: "" },
      signerUserAgent: { type: String, default: "" },
      documentHash: { type: String, default: "" },
      signatureAlgorithm: { type: String, default: "" },
      digitalSignatureValue: { type: String, default: "" },
      certificateIssuer: { type: String, default: "" },
      certificateInfo: { type: String, default: "" },
      signatureImage: { type: String, default: "" },
      signatureType: { type: String, enum: ["drawn", "typed"], default: "drawn" },
      signedDocumentUrl: { type: String, default: "" },
    },

    auditTrail: [auditTrailSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

// High-concurrency compound indexes
agreementSchema.index({ publicTokenHash: 1, status: 1 });
agreementSchema.index({ agreementNumber: 1, version: -1 });
agreementSchema.index({ "client.phone": 1, status: 1, createdAt: -1 });
agreementSchema.index({ status: 1, createdAt: -1 });

export const AgreementModel = models.Agreement || model<IAgreement>("Agreement", agreementSchema);
