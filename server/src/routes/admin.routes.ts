import { Router } from "express";
import {
  adminSignup,
  adminLogin,
  adminLogout,
  getAdminProfile,
  triggerROI,
  triggerDailyCalculations,
  getCalculationJobStatus,
  resumeCalculationJob,
  getLatestCalculationJob,
  getAllUsers,
  impersonateUser,
  getAdminStatistics,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  updateUserStatus,
  updateUserProfile,
  deleteUser,
  flushAllInvestments,
  flushAllUserData,
  getNOWPaymentsStatus,
  updateNOWPaymentsStatus,
  getAuthRateLimitingStatus,
  updateAuthRateLimitingStatus,
  deactivateAllUsers,
  getWithdrawalSchedules,
  updateWithdrawalSchedule,
  changeUserPassword,
  getAdminReports,
  getDailyBusinessReport,
  getDailyBusinessSummary,
  getNOWPaymentsReport,
  getCountryBusinessReport,
  getInvestmentsReport,
  getWithdrawalsReport,
  getBinaryReport,
  getReferralReport,
  getROIReport,
  adminCreateInvestment,
  getAdminCreatedInvestments,
  addFundsToWallet,
  removeFundsFromWallet,
  getAllTickets,
  updateTicket,
  getAllVouchers,
  createVoucherForUser,
  createPowerlegAccounts,
  createPowerlegInvestment,
  createFreeAccounts,
  getFreeAccountsList,
  setBinaryTarget,
  getUserTargetStatus,
  getUserBio,
  createTemporaryPassword,
  getDirectReferrals,
  getUserReports,
  addMainWalletToAllUsers,
  restoreSignupBonus,
  testEmailTemplate,
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
// import {
//   getAllKYC,
//   updateKYCStatus,
// } from "../controllers/kyc.controller"; // Temporarily disabled
import { requireAdminAuth } from "../middleware/admin.middleware";
import multer from "multer";

const router = Router();

// Public routes
// SECURITY FIX: Admin signup disabled - must be created manually or via secure script
// router.post("/signup", adminSignup); // DISABLED - CRITICAL SECURITY VULNERABILITY
router.post("/login", adminLogin);
// SECURITY FIX: Password change now requires admin authentication
// router.put("/users/:userId/password", changeUserPassword); // MOVED TO PROTECTED ROUTES BELOW

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
router.get("/calculation-job/latest", requireAdminAuth, getLatestCalculationJob);
router.get("/calculation-job/:jobId", requireAdminAuth, getCalculationJobStatus);
router.post("/calculation-job/:jobId/resume", requireAdminAuth, resumeCalculationJob);

// User management (admin only)
router.get("/users", requireAdminAuth, getAllUsers);
router.get("/users/:userId/bio", requireAdminAuth, getUserBio);
router.post("/users/:userId/temporary-password", requireAdminAuth, createTemporaryPassword);
router.get("/users/:userId/direct-referrals", requireAdminAuth, getDirectReferrals);
router.get("/users/:userId/reports", requireAdminAuth, getUserReports);
router.post("/impersonate/:userId", requireAdminAuth, impersonateUser);
router.put("/users/:userId/status", requireAdminAuth, updateUserStatus);
router.put("/users/:userId/profile", requireAdminAuth, updateUserProfile);
router.put("/users/:userId/password", requireAdminAuth, changeUserPassword); // SECURITY FIX: Now requires admin auth
router.delete("/users/:userId", requireAdminAuth, deleteUser);

// Admin statistics
router.get("/statistics", requireAdminAuth, getAdminStatistics);
router.get("/daily-business-summary", requireAdminAuth, getDailyBusinessSummary);

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
router.get("/investments/admin-created", requireAdminAuth, getAdminCreatedInvestments);
router.post("/investments/create", requireAdminAuth, adminCreateInvestment);

// Wallet management routes (admin only)
router.post("/wallet/add-funds", requireAdminAuth, addFundsToWallet);
router.post("/wallet/remove-funds", requireAdminAuth, removeFundsFromWallet);
router.post("/wallet/add-main-wallet-to-all", requireAdminAuth, addMainWalletToAllUsers);
router.post("/wallet/restore-signup-bonus", requireAdminAuth, restoreSignupBonus);

// Influencer management
router.post("/influencer/powerleg/create", requireAdminAuth, createPowerlegAccounts);
router.post("/influencer/powerleg/investment", requireAdminAuth, createPowerlegInvestment);
router.get("/influencer/free/list", requireAdminAuth, getFreeAccountsList);
router.post("/influencer/free/create", requireAdminAuth, createFreeAccounts);

// Binary target management
router.post("/users/:userId/set-binary-target", requireAdminAuth, setBinaryTarget);
router.get("/users/:userId/target-status", requireAdminAuth, getUserTargetStatus);

router.delete("/investments/flush-all", requireAdminAuth, flushAllInvestments);
router.delete("/flush-user-data", requireAdminAuth, flushAllUserData);

// Ticket management
router.get("/tickets", requireAdminAuth, getAllTickets);
router.put("/tickets/:ticketId", requireAdminAuth, updateTicket);

// Email templates test (temporary – admin only)
router.post("/email-templates/test", requireAdminAuth, testEmailTemplate);

// Settings management
router.get("/settings/nowpayments", requireAdminAuth, getNOWPaymentsStatus);
router.put("/settings/nowpayments", requireAdminAuth, updateNOWPaymentsStatus);
router.get("/settings/auth-rate-limiting", requireAdminAuth, getAuthRateLimitingStatus);
router.put("/settings/auth-rate-limiting", requireAdminAuth, updateAuthRateLimitingStatus);
router.post("/settings/deactivate-all-users", requireAdminAuth, deactivateAllUsers);
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

// KYC management (admin only) - Temporarily disabled
// router.get("/kyc", requireAdminAuth, getAllKYC);
// router.put("/kyc/:id/status", requireAdminAuth, updateKYCStatus);

export default router;