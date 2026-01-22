import { Router } from "express";
import {
  submitKYC,
  getUserKYC,
} from "../controllers/kyc.controller";
import { requireAuth } from "../middleware/auth.middleware";
import multer from "multer";

const router = Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for KYC documents
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for KYC documents"));
    }
  },
});

// User routes (require authentication)
router.post("/", requireAuth, upload.single("document"), submitKYC);
router.get("/", requireAuth, getUserKYC);

export default router;
