import { Router } from "express";
import {
  adminSignup,
  adminLogin,
  adminLogout,
  getAdminProfile,
  triggerROI,
  triggerDailyCalculations,
  getAllUsers,
  impersonateUser,
  getAdminStatistics,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  updateUserStatus,
  deleteUser,
  flushAllInvestments,
  getNOWPaymentsStatus,
  updateNOWPaymentsStatus,
  getAuthRateLimitingStatus,
  updateAuthRateLimitingStatus,
  getWithdrawalSchedules,
  updateWithdrawalSchedule,
  changeUserPassword,
  getAdminReports,
  getDailyBusinessReport,
  getNOWPaymentsReport,
  getCountryBusinessReport,
  getInvestmentsReport,
  getWithdrawalsReport,
  getBinaryReport,
  getReferralReport,
  getROIReport,
  adminCreateInvestment,
  getAllTickets,
  updateTicket,
  getAllVouchers,
  createVoucherForUser,
} from "../controllers/admin.controller";
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from "../controllers/package.controller";
import {
  getAllCareerLevels,
  getCareerLevelById,
  createCareerLevel,
  updateCareerLevel,
  deleteCareerLevel,
  getUserCareerProgressAdmin,
  getAllUsersCareerProgress,
} from "../controllers/career-level.controller";
import {
  getAllGalleryItemsAdmin,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getGalleryCategories,
  uploadGalleryMedia,
} from "../controllers/gallery.controller";
import { requireAdminAuth } from "../middleware/admin.middleware";
import multer from "multer";

const router = Router();

// Public routes
router.post("/signup", adminSignup);
router.post("/login", adminLogin);
router.put("/users/:userId/password", changeUserPassword); // Public - no auth required

// Protected routes (require admin authentication)
router.post("/logout", requireAdminAuth, adminLogout);
router.get("/me", requireAdminAuth, getAdminProfile);

// Package CRUD routes (admin only)
router.get("/packages", requireAdminAuth, getAllPackages);
router.get("/packages/:id", requireAdminAuth, getPackageById);
router.post("/packages", requireAdminAuth, createPackage);
router.put("/packages/:id", requireAdminAuth, updatePackage);
router.delete("/packages/:id", requireAdminAuth, deletePackage);

// ROI Cron trigger (admin only)
router.post("/trigger-roi", requireAdminAuth, triggerROI);

// Daily calculations trigger (ROI, Binary, Referral) - admin only
router.post("/trigger-daily-calculations", requireAdminAuth, triggerDailyCalculations);

// User management (admin only)
router.get("/users", requireAdminAuth, getAllUsers);
router.post("/impersonate/:userId", requireAdminAuth, impersonateUser);
router.put("/users/:userId/status", requireAdminAuth, updateUserStatus);
router.delete("/users/:userId", requireAdminAuth, deleteUser);

// Admin statistics
router.get("/statistics", requireAdminAuth, getAdminStatistics);

// Admin reports
router.get("/reports", requireAdminAuth, getAdminReports);
router.get("/reports/daily-business", requireAdminAuth, getDailyBusinessReport);
router.get("/reports/nowpayments", requireAdminAuth, getNOWPaymentsReport);
router.get("/reports/country-business", requireAdminAuth, getCountryBusinessReport);
router.get("/reports/investments", requireAdminAuth, getInvestmentsReport);
router.get("/reports/withdrawals", requireAdminAuth, getWithdrawalsReport);
router.get("/reports/binary", requireAdminAuth, getBinaryReport);
router.get("/reports/referral", requireAdminAuth, getReferralReport);
router.get("/reports/roi", requireAdminAuth, getROIReport);

// Withdrawal management
router.get("/withdrawals", requireAdminAuth, getAllWithdrawals);
router.post("/withdrawals/:id/approve", requireAdminAuth, approveWithdrawal);
router.post("/withdrawals/:id/reject", requireAdminAuth, rejectWithdrawal);

// Investment management
router.post("/investments/create", requireAdminAuth, adminCreateInvestment);
router.delete("/investments/flush-all", requireAdminAuth, flushAllInvestments);

// Ticket management
router.get("/tickets", requireAdminAuth, getAllTickets);
router.put("/tickets/:ticketId", requireAdminAuth, updateTicket);

// Settings management
router.get("/settings/nowpayments", requireAdminAuth, getNOWPaymentsStatus);
router.put("/settings/nowpayments", requireAdminAuth, updateNOWPaymentsStatus);
router.get("/settings/auth-rate-limiting", requireAdminAuth, getAuthRateLimitingStatus);
router.put("/settings/auth-rate-limiting", requireAdminAuth, updateAuthRateLimitingStatus);
router.get("/settings/withdrawal-schedules", requireAdminAuth, getWithdrawalSchedules);
router.put("/settings/withdrawal-schedules", requireAdminAuth, updateWithdrawalSchedule);

// Career level management
router.get("/career-levels", requireAdminAuth, getAllCareerLevels);
router.get("/career-levels/:id", requireAdminAuth, getCareerLevelById);
router.post("/career-levels", requireAdminAuth, createCareerLevel);
router.put("/career-levels/:id", requireAdminAuth, updateCareerLevel);
router.delete("/career-levels/:id", requireAdminAuth, deleteCareerLevel);

// Career progress management
router.get("/career-progress", requireAdminAuth, getAllUsersCareerProgress);
router.get("/career-progress/:userId", requireAdminAuth, getUserCareerProgressAdmin);

// Voucher management
router.get("/vouchers", requireAdminAuth, getAllVouchers);
router.post("/vouchers", requireAdminAuth, createVoucherForUser);

// Gallery management
router.get("/gallery", requireAdminAuth, getAllGalleryItemsAdmin);
router.get("/gallery/categories", requireAdminAuth, getGalleryCategories);
router.get("/gallery/:id", requireAdminAuth, getGalleryItemById);
router.post("/gallery", requireAdminAuth, createGalleryItem);
router.put("/gallery/:id", requireAdminAuth, updateGalleryItem);
router.delete("/gallery/:id", requireAdminAuth, deleteGalleryItem);

// Gallery media upload (with multer middleware)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
});
router.post("/gallery/upload", requireAdminAuth, upload.single("file"), uploadGalleryMedia);

export default router;