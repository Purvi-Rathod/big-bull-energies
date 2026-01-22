import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { KYC, IKYC, DocumentType, KYCStatus } from "../models/KYC";
import { User } from "../models/User";
import { uploadToCloudinary } from "../services/cloudinary.service";

/**
 * Submit KYC document
 * POST /api/v1/user/kyc
 */
export const submitKYC = asyncHandler(async (req: any, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  if (!req.file) {
    throw new AppError("No document file uploaded", 400);
  }

  const { documentType, dateOfBirth } = req.body;

  if (!documentType || !dateOfBirth) {
    throw new AppError("Document type and date of birth are required", 400);
  }

  if (!["passport", "pan", "id_card"].includes(documentType)) {
    throw new AppError("Invalid document type. Must be passport, pan, or id_card", 400);
  }

  // Validate date of birth
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) {
    throw new AppError("Invalid date of birth", 400);
  }

  // Check if user already has a pending or approved KYC
  const existingKYC = await KYC.findOne({
    user: userId,
    status: { $in: ["pending", "approved"] },
  });

  if (existingKYC) {
    throw new AppError(
      `You already have a ${existingKYC.status} KYC submission. Please wait for review or contact support.`,
      400
    );
  }

  // Upload document to Cloudinary
  const uploadResult = await uploadToCloudinary(
    req.file.buffer,
    `kyc/${userId}`,
    "image",
    {
      overwrite: false,
      invalidate: true,
    }
  );

  // Create KYC record
  const kyc = await KYC.create({
    user: userId,
    documentType: documentType as DocumentType,
    dateOfBirth: dob,
    documentUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    status: "pending",
  });

  const response = res as any;
  // Prevent caching for POST requests
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');
  
  response.status(201).json({
    status: "success",
    message: "KYC document submitted successfully",
    data: {
      kyc: {
        id: kyc._id,
        documentType: kyc.documentType,
        dateOfBirth: kyc.dateOfBirth,
        status: kyc.status,
        createdAt: kyc.createdAt,
      },
    },
  });
});

/**
 * Get current user's KYC status
 * GET /api/v1/user/kyc
 */
export const getUserKYC = asyncHandler(async (req: any, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const kyc = await KYC.findOne({ user: userId })
    .sort({ createdAt: -1 })
    .populate("reviewedBy", "name email")
    .lean();

  const response = res as any;
  // Prevent caching for GET requests to ensure fresh data
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');
  
  response.status(200).json({
    status: "success",
    data: {
      kyc: kyc
        ? {
            id: kyc._id,
            documentType: kyc.documentType,
            dateOfBirth: kyc.dateOfBirth,
            documentUrl: kyc.documentUrl,
            status: kyc.status,
            reviewedBy: kyc.reviewedBy,
            reviewedAt: kyc.reviewedAt,
            rejectionReason: kyc.rejectionReason,
            createdAt: kyc.createdAt,
            updatedAt: kyc.updatedAt,
          }
        : null,
    },
  });
});

/**
 * Get all KYC submissions (Admin only)
 * GET /api/v1/admin/kyc
 */
export const getAllKYC = asyncHandler(async (req: any, res) => {
  const { page = 1, limit = 50, status, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Build query
  const query: any = {};
  if (status && ["pending", "approved", "rejected"].includes(status as string)) {
    query.status = status;
  }

  // Search by user name, email, or userId
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
      ],
    }).select("_id");
    const userIds = users.map((u) => u._id);
    query.user = { $in: userIds };
  }

  // Get KYC records with pagination
  const kycRecords = await KYC.find(query)
    .populate("user", "userId name email phone")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Get total count
  const total = await KYC.countDocuments(query);

  const response = res as any;
  // Prevent caching for GET requests to ensure fresh data
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');
  
  response.status(200).json({
    status: "success",
    data: {
      kycRecords: kycRecords.map((kyc) => ({
        id: kyc._id,
        user: kyc.user,
        documentType: kyc.documentType,
        dateOfBirth: kyc.dateOfBirth,
        documentUrl: kyc.documentUrl,
        status: kyc.status,
        reviewedBy: kyc.reviewedBy,
        reviewedAt: kyc.reviewedAt,
        rejectionReason: kyc.rejectionReason,
        createdAt: kyc.createdAt,
        updatedAt: kyc.updatedAt,
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/**
 * Update KYC status (Admin only)
 * PUT /api/v1/admin/kyc/:id/status
 */
export const updateKYCStatus = asyncHandler(async (req: any, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const adminId = (req as any).admin?.id;

  if (!status || !["approved", "rejected"].includes(status)) {
    throw new AppError("Valid status (approved or rejected) is required", 400);
  }

  if (status === "rejected" && !rejectionReason) {
    throw new AppError("Rejection reason is required when rejecting KYC", 400);
  }

  const kyc = await KYC.findById(id);
  if (!kyc) {
    throw new AppError("KYC record not found", 404);
  }

  kyc.status = status as KYCStatus;
  kyc.reviewedBy = adminId;
  kyc.reviewedAt = new Date();
  if (status === "rejected") {
    kyc.rejectionReason = rejectionReason;
  } else {
    kyc.rejectionReason = undefined;
  }

  await kyc.save();

  const response = res as any;
  // Prevent caching for PUT requests
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');
  
  response.status(200).json({
    status: "success",
    message: `KYC ${status} successfully`,
    data: {
      kyc: {
        id: kyc._id,
        documentType: kyc.documentType,
        dateOfBirth: kyc.dateOfBirth,
        status: kyc.status,
        reviewedBy: kyc.reviewedBy,
        reviewedAt: kyc.reviewedAt,
        rejectionReason: kyc.rejectionReason,
      },
    },
  });
});
