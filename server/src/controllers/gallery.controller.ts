import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Gallery } from "../models/Gallery";
import { Types } from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from "../services/cloudinary.service";

/**
 * Get all gallery items (public - filtered by status)
 * GET /api/v1/gallery
 */
export const getAllGalleryItems = asyncHandler(async (req, res) => {
  const { category, status = "Active" } = req.query;

  const query: any = { status };
  if (category) {
    query.category = category;
  }

  const items = await Gallery.find(query)
    .sort({ category: 1, order: 1, createdAt: -1 })
    .lean();

  // Group by category
  const groupedByCategory: { [key: string]: any[] } = {};
  items.forEach((item) => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      items,
      categories: Object.keys(groupedByCategory),
      groupedByCategory,
    },
  });
});

/**
 * Get all gallery items (admin - all items)
 * GET /api/v1/admin/gallery
 */
export const getAllGalleryItemsAdmin = asyncHandler(async (req, res) => {
  const { category, status, page = 1, limit = 50 } = req.query;

  const query: any = {};
  if (category) {
    query.category = category;
  }
  if (status) {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const items = await Gallery.find(query)
    .sort({ category: 1, order: 1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Gallery.countDocuments(query);

  // Get unique categories
  const categories = await Gallery.distinct("category");

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      items,
      categories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/**
 * Get single gallery item by ID
 * GET /api/v1/admin/gallery/:id
 */
export const getGalleryItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid gallery item ID", 400);
  }

  const item = await Gallery.findById(id);
  if (!item) {
    throw new AppError("Gallery item not found", 404);
  }

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});

/**
 * Create new gallery item
 * POST /api/v1/admin/gallery
 */
export const createGalleryItem = asyncHandler(async (req, res) => {
  const { title, description, mediaUrl, mediaType, category, thumbnailUrl, order, status } = req.body;

  // Validation
  if (!title) {
    throw new AppError("Title is required", 400);
  }
  if (!mediaUrl) {
    throw new AppError("Media URL is required", 400);
  }
  if (!mediaType || !["photo", "video"].includes(mediaType)) {
    throw new AppError("Media type must be 'photo' or 'video'", 400);
  }
  if (!category) {
    throw new AppError("Category is required", 400);
  }

  const item = await Gallery.create({
    title,
    description: description || "",
    mediaUrl,
    mediaType,
    category,
    thumbnailUrl: thumbnailUrl || "",
    order: order || 0,
    status: status || "Active",
  });

  const response = res as any;
  response.status(201).json({
    status: "success",
    message: "Gallery item created successfully",
    data: {
      item,
    },
  });
});

/**
 * Update gallery item
 * PUT /api/v1/admin/gallery/:id
 */
export const updateGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, mediaUrl, mediaType, category, thumbnailUrl, order, status } = req.body;

  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid gallery item ID", 400);
  }

  const item = await Gallery.findById(id);
  if (!item) {
    throw new AppError("Gallery item not found", 404);
  }

  // Update fields
  if (title !== undefined) item.title = title;
  if (description !== undefined) item.description = description;
  if (mediaUrl !== undefined) item.mediaUrl = mediaUrl;
  if (mediaType !== undefined) {
    if (!["photo", "video"].includes(mediaType)) {
      throw new AppError("Media type must be 'photo' or 'video'", 400);
    }
    item.mediaType = mediaType;
  }
  if (category !== undefined) item.category = category;
  if (thumbnailUrl !== undefined) item.thumbnailUrl = thumbnailUrl;
  if (order !== undefined) item.order = order;
  if (status !== undefined) {
    if (!["Active", "InActive"].includes(status)) {
      throw new AppError("Status must be 'Active' or 'InActive'", 400);
    }
    item.status = status;
  }

  await item.save();

  const response = res as any;
  response.status(200).json({
    status: "success",
    message: "Gallery item updated successfully",
    data: {
      item,
    },
  });
});

/**
 * Delete gallery item
 * DELETE /api/v1/admin/gallery/:id
 */
export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid gallery item ID", 400);
  }

  const item = await Gallery.findById(id);
  if (!item) {
    throw new AppError("Gallery item not found", 404);
  }

  // Try to delete from Cloudinary if it's a Cloudinary URL
  try {
    const publicId = extractPublicIdFromUrl(item.mediaUrl);
    if (publicId) {
      const resourceType = item.mediaType === "video" ? "video" : "image";
      await deleteFromCloudinary(publicId, resourceType);
    }
  } catch (error: any) {
    console.error("Failed to delete from Cloudinary:", error);
    // Continue with database deletion even if Cloudinary deletion fails
  }

  await Gallery.findByIdAndDelete(id);

  const response = res as any;
  response.status(200).json({
    status: "success",
    message: "Gallery item deleted successfully",
  });
});

/**
 * Get all unique categories
 * GET /api/v1/admin/gallery/categories
 */
export const getGalleryCategories = asyncHandler(async (req, res) => {
  const categories = await Gallery.distinct("category");

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      categories,
    },
  });
});

/**
 * Upload media file to Cloudinary
 * POST /api/v1/admin/gallery/upload
 */
export const uploadGalleryMedia = asyncHandler(async (req: any, res) => {
  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  const { folder = "gallery", resourceType = "auto" } = req.body;

  // Determine resource type from file mimetype if not specified
  let detectedResourceType: "image" | "video" | "auto" | "raw" = "auto";
  if (resourceType === "auto") {
    if (req.file.mimetype.startsWith("image/")) {
      detectedResourceType = "image";
    } else if (req.file.mimetype.startsWith("video/")) {
      detectedResourceType = "video";
    }
  } else {
    detectedResourceType = resourceType as "image" | "video" | "auto" | "raw";
  }

  try {
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      folder,
      detectedResourceType,
      {
        overwrite: false,
        invalidate: true,
      }
    );

    const response = res as any;
    response.status(200).json({
      status: "success",
      message: "File uploaded successfully",
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        resourceType: uploadResult.resource_type,
      },
    });
  } catch (error: any) {
    throw new AppError(`Failed to upload file: ${error.message}`, 500);
  }
});
