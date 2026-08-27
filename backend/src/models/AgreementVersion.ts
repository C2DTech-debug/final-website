import { Schema, model, models, type Document } from "mongoose";

export interface IAgreementVersion extends Document {
  agreementId: Schema.Types.ObjectId;
  agreementNumber: string;
  version: number;
  status: string;
  snapshot: Record<string, unknown>;
  documentHash?: string;
  signedAt?: Date;
  signedDocumentUrl?: string;
  signingProvider?: string;
  signingReference?: string;
  signatureImage?: string;
  signatureType?: string;
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
}

const agreementVersionSchema = new Schema<IAgreementVersion>(
  {
    agreementId: {
      type: Schema.Types.ObjectId,
      ref: "Agreement",
      required: true,
      index: true,
    },
    agreementNumber: {
      type: String,
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    snapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    documentHash: {
      type: String,
      default: "",
    },
    signedAt: {
      type: Date,
    },
    signedDocumentUrl: {
      type: String,
      default: "",
    },
    signingProvider: {
      type: String,
      default: "",
    },
    signingReference: {
      type: String,
      default: "",
    },
    signatureImage: {
      type: String,
      default: "",
    },
    signatureType: {
      type: String,
      default: "drawn",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Unique compound index on agreementId + version
agreementVersionSchema.index({ agreementId: 1, version: 1 }, { unique: true });

export const AgreementVersionModel =
  models.AgreementVersion || model<IAgreementVersion>("AgreementVersion", agreementVersionSchema);
