// models/Gallery.ts
import mongoose, { Schema, model, Document } from "mongoose";

export interface IGallery extends Document {
  title: string;
  description?: string;
  mediaUrl: string; // URL/link to the photo or video
  mediaType: "photo" | "video"; // Type of media
  category: string; // e.g., "Office Video", "Solar Plant 1", "Solar Plant 2", "Events"
  thumbnailUrl?: string; // Optional thumbnail URL for videos
  order: number; // Display order within category
  status: "Active" | "InActive"; // Whether to show on public gallery
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    mediaUrl: { type: String, required: true }, // Link/URL to the media
    mediaType: { type: String, enum: ["photo", "video"], required: true },
    category: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "InActive"], default: "Active" },
  },
  { timestamps: true }
);

// Index for efficient queries
GallerySchema.index({ category: 1, status: 1, order: 1 });
GallerySchema.index({ status: 1 });

export const Gallery = model<IGallery>("Gallery", GallerySchema);
