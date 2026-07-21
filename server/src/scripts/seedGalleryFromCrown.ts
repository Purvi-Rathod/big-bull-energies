/**
 * Seed gallery items from Crown Bankers public API into Big Bull MongoDB.
 * Run on server: npx ts-node -r dotenv/config src/scripts/seedGalleryFromCrown.ts
 * Or: node dist/scripts/seedGalleryFromCrown.js (after build)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Gallery } from "../models/Gallery";

dotenv.config({ path: "./.env" });

const SOURCE_URL =
  process.env.GALLERY_SOURCE_URL ||
  "https://api.crownbankers.com/api/v1/gallery";

async function main() {
  const mongoUrl =
    process.env.NODE_ENV === "production"
      ? process.env.MONGODB_URL_PRODUCTION || process.env.MONGODB_URL_DEVELOPMENT
      : process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URL_PRODUCTION;

  if (!mongoUrl) {
    throw new Error("MongoDB URL not found in env");
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUrl);

  const existing = await Gallery.countDocuments();
  console.log(`Existing gallery items: ${existing}`);

  if (existing > 0 && process.env.FORCE_SEED !== "1") {
    console.log("Gallery already has items. Set FORCE_SEED=1 to re-seed.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Fetching from ${SOURCE_URL}...`);
  const res = await fetch(SOURCE_URL);
  const json = (await res.json()) as {
    status: string;
    data?: { items?: Array<Record<string, unknown>> };
  };

  if (json.status !== "success" || !json.data?.items?.length) {
    throw new Error("Source gallery returned no items");
  }

  const items = json.data.items.map((item) => ({
    title: String(item.title || "Untitled"),
    description: String(item.description || ""),
    mediaUrl: String(item.mediaUrl),
    mediaType: (item.mediaType === "video" ? "video" : "photo") as
      | "photo"
      | "video",
    category: String(item.category || "General"),
    thumbnailUrl: String(item.thumbnailUrl || item.mediaUrl || ""),
    order: Number(item.order ?? 0),
    status: (item.status === "InActive" ? "InActive" : "Active") as
      | "Active"
      | "InActive",
  }));

  if (process.env.FORCE_SEED === "1" && existing > 0) {
    await Gallery.deleteMany({});
    console.log(`Cleared ${existing} existing items`);
  }

  const inserted = await Gallery.insertMany(items);
  console.log(`Inserted ${inserted.length} gallery items`);

  const categories = await Gallery.distinct("category");
  console.log("Categories:", categories.join(", "));

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
