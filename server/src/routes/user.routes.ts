import { Router } from "express";
import {
  getUserWallets,
  getUserPackages,
  createInvestment,
  getUserInvestments,
  getUserBinaryTree,
  getUserTransactions,
  getUserReports,
  createWithdrawal,
  getWithdrawalSchedule,
  getUserVouchers,
  createVoucher,
  getMinimumVoucherAmount,
  updateWalletAddress,
  updateUserProfile,
  getUserReferralLinks,
  getUserDirectReferrals,
  getUserCareerProgressController,
  createTicket,
  getUserTickets,
} from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// All routes require user authentication
router.get("/wallets", requireAuth, getUserWallets);
router.get("/packages", requireAuth, getUserPackages);
router.post("/invest", requireAuth, createInvestment);
router.get("/investments", requireAuth, getUserInvestments);
router.get("/binary-tree", requireAuth, getUserBinaryTree);
router.get("/transactions", requireAuth, getUserTransactions);
router.get("/reports", requireAuth, getUserReports);
router.get("/withdrawal-schedule", requireAuth, getWithdrawalSchedule);
router.post("/withdraw", requireAuth, createWithdrawal);
router.get("/vouchers", requireAuth, getUserVouchers);
router.get("/vouchers/minimum-amount", requireAuth, getMinimumVoucherAmount);
router.post("/vouchers/create", requireAuth, createVoucher);
router.put("/wallet-address", requireAuth, updateWalletAddress);
router.put("/profile", requireAuth, updateUserProfile);
router.get("/referral-links", requireAuth, getUserReferralLinks);
router.get("/direct-referrals", requireAuth, getUserDirectReferrals);
// Wallet Exchange feature has been removed - users should use vouchers for reinvestment
// router.post("/wallet-exchange", requireAuth, exchangeWalletFunds);
router.get("/career-progress", requireAuth, getUserCareerProgressController);
router.post("/tickets", requireAuth, createTicket);
router.get("/tickets", requireAuth, getUserTickets);

export default router;

