// models/KYC.ts
import { Schema, model, Document, Types } from "mongoose";

export type DocumentType = "passport" | "pan" | "id_card";
export type KYCStatus = "pending" | "approved" | "rejected";

export interface IKYC extends Document {
  user: Types.ObjectId;
  documentType: DocumentType;
  dateOfBirth: Date;
  documentUrl: string;
  publicId: string; // Cloudinary public ID
  status: KYCStatus;
  reviewedBy?: Types.ObjectId; // Admin who reviewed
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KYCSchema = new Schema<IKYC>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ["passport", "pan", "id_card"],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
KYCSchema.index({ user: 1, status: 1 });
KYCSchema.index({ status: 1 });
KYCSchema.index({ createdAt: -1 });

export const KYC = model<IKYC>("KYC", KYCSchema);
