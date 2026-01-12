import { Router } from "express";
import { getAllGalleryItems } from "../controllers/gallery.controller";

const router = Router();

// Public gallery route (no authentication required)
router.get("/", getAllGalleryItems);

export default router;
