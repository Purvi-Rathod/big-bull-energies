import mongoose, { Schema, Document } from "mongoose";
import { Types } from "mongoose";

export interface ICalculationJob extends Document {
  jobType: "daily_calculations" | "roi_only" | "binary_only";
  status: "pending" | "processing" | "completed" | "failed" | "paused";
  startedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  
  // Progress tracking
  totalItems: number;
  processedItems: number;
  failedItems: number;
  
  // Resumable tracking - store IDs that have been processed
  processedUserIds: Types.ObjectId[];
  processedInvestmentIds: Types.ObjectId[];
  
  // Results
  results?: {
    roi?: {
      success: boolean;
      processed: number;
      errors: number;
      total: number;
      error?: string;
    };
    binary?: {
      success: boolean;
      processed: number;
      errors: number;
      totalBinaryPaid: number;
      total: number;
      error?: string;
    };
    referral?: {
      success: boolean;
      message: string;
      processed: number;
      errors: number;
      total: number;
    };
  };
  
  // Error tracking
  lastError?: string;
  errorDetails?: any;
  
  // Configuration
  includeROI: boolean;
  includeBinary: boolean;
  includeReferral: boolean;
  
  // Metadata
  triggeredBy?: Types.ObjectId; // Admin user ID
  createdAt: Date;
  updatedAt: Date;
}

const CalculationJobSchema = new Schema<ICalculationJob>(
  {
    jobType: {
      type: String,
      enum: ["daily_calculations", "roi_only", "binary_only"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "paused"],
      default: "pending",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    processedItems: {
      type: Number,
      default: 0,
    },
    failedItems: {
      type: Number,
      default: 0,
    },
    processedUserIds: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    processedInvestmentIds: [{
      type: Schema.Types.ObjectId,
      ref: "Investment",
    }],
    results: {
      type: Schema.Types.Mixed,
    },
    lastError: {
      type: String,
    },
    errorDetails: {
      type: Schema.Types.Mixed,
    },
    includeROI: {
      type: Boolean,
      default: true,
    },
    includeBinary: {
      type: Boolean,
      default: true,
    },
    includeReferral: {
      type: Boolean,
      default: true,
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding active jobs
CalculationJobSchema.index({ status: 1, createdAt: -1 });
CalculationJobSchema.index({ jobType: 1, status: 1 });

export const CalculationJob = mongoose.model<ICalculationJob>(
  "CalculationJob",
  CalculationJobSchema
);
